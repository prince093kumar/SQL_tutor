import { appDb, practiceDb } from '../config/db.js';
import { resetPracticeDatabase } from '../../database/init.js';

class QueryRepository {
    constructor() {
        this.provisionedUsers = new Set();
    }

    async ensureUserDbPermissions(userId) {
        if (!userId || this.provisionedUsers.has(userId)) return;
        
        const username = `u_${userId}`;
        // Create user if not exists
        const [rows] = await appDb.query(`SELECT User FROM mysql.user WHERE User = ?`, [username]);
        if (rows.length === 0) {
            await appDb.query(`CREATE USER '${username}'@'%' IDENTIFIED BY 'sandbox'`);
            await appDb.query(`GRANT SELECT, SHOW VIEW ON practice_db.* TO '${username}'@'%'`);
            await appDb.query(`GRANT ALL PRIVILEGES ON \`user\\_${userId}\\__%\`.* TO '${username}'@'%'`);
            await appDb.query(`FLUSH PRIVILEGES`);
        }
        this.provisionedUsers.add(userId);
    }

    rewriteDatabaseDDL(sql, userId) {
        let finalSql = sql;
        const createDbMatch = finalSql.match(/^\s*CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
        if (createDbMatch) {
            const dbName = createDbMatch[2];
            const isolatedDbName = `user_${userId}_${dbName}`;
            finalSql = finalSql.replace(new RegExp(`\\b${dbName}\\b`, 'g'), isolatedDbName); 
        }

        const dropDbMatch = finalSql.match(/^\s*DROP\s+DATABASE\s+(IF\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
        if (dropDbMatch) {
            const dbName = dropDbMatch[2];
            const isolatedDbName = `user_${userId}_${dbName}`;
            finalSql = finalSql.replace(new RegExp(`\\b${dbName}\\b`, 'g'), isolatedDbName);
        }
        return finalSql;
    }

    async executeQuery(sql, databaseName = 'practice_db', userId = null) {
        let targetDb = databaseName;
        if (userId && targetDb !== 'practice_db' && !targetDb.startsWith(`user_${userId}_`)) {
            targetDb = `user_${userId}_${targetDb}`;
        }
        
        let querySql = sql;
        if (userId) {
            await this.ensureUserDbPermissions(userId);
            querySql = this.rewriteDatabaseDDL(sql, userId);
        }

        const connection = await practiceDb.getConnection();
        try {
            if (userId) {
                await connection.changeUser({ user: `u_${userId}`, password: 'sandbox', database: targetDb });
            } else {
                await connection.changeUser({ database: targetDb });
            }
            
            const [rows, fields] = await connection.query(querySql);
            const isRowResult = Array.isArray(rows);

            return {
                rows: isRowResult ? rows : [],
                fields: this.mapFields(fields || []),
                affectedRows: isRowResult ? 0 : rows.affectedRows ?? 0,
                insertId: isRowResult ? 0 : rows.insertId ?? 0,
                warningStatus: isRowResult ? 0 : rows.warningStatus ?? 0,
                raw: rows
            };
        } finally {
            if (userId) {
                // Revert to root user for the pool
                await connection.changeUser({ user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || 'root', database: 'practice_db' });
            }
            connection.release();
        }
    }

    async getExplainPlan(sql, databaseName = 'practice_db', userId = null) {
        let targetDb = databaseName;
        if (userId && targetDb !== 'practice_db' && !targetDb.startsWith(`user_${userId}_`)) {
            targetDb = `user_${userId}_${targetDb}`;
        }
        
        let querySql = sql;
        if (userId) {
            await this.ensureUserDbPermissions(userId);
            querySql = this.rewriteDatabaseDDL(sql, userId);
        }

        const connection = await practiceDb.getConnection();
        try {
            if (userId) {
                await connection.changeUser({ user: `u_${userId}`, password: 'sandbox', database: targetDb });
            } else {
                await connection.changeUser({ database: targetDb });
            }
            // MySQL 8 supports EXPLAIN FORMAT=JSON
            const [rows] = await connection.query(`EXPLAIN FORMAT=JSON ${querySql}`);
            return rows;
        } finally {
            if (userId) {
                await connection.changeUser({ user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || 'root', database: 'practice_db' });
            }
            connection.release();
        }
    }

    async getSchema(databaseName = 'practice_db', userId = null) {
        let targetDb = databaseName;
        if (userId && targetDb !== 'practice_db' && !targetDb.startsWith(`user_${userId}_`)) {
            targetDb = `user_${userId}_${targetDb}`;
        }

        const [columns] = await practiceDb.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `, [targetDb]);
        
        const [views] = await practiceDb.query(`
            SELECT TABLE_NAME
            FROM information_schema.VIEWS
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME
        `, [targetDb]);
        
        const [relationships] = await practiceDb.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ?
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        `, [targetDb]);

        const tables = columns.reduce((acc, column) => {
            let table = acc.find(item => item.name === column.TABLE_NAME);
            if (!table) {
                table = { name: column.TABLE_NAME, columns: [] };
                acc.push(table);
            }

            table.columns.push({
                name: column.COLUMN_NAME,
                type: column.DATA_TYPE,
                key: column.COLUMN_KEY
            });

            return acc;
        }, []);

        return {
            database: targetDb,
            tables,
            views: views.map(view => view.TABLE_NAME),
            relationships: relationships.map(relationship => ({
                table: relationship.TABLE_NAME,
                column: relationship.COLUMN_NAME,
                referencedTable: relationship.REFERENCED_TABLE_NAME,
                referencedColumn: relationship.REFERENCED_COLUMN_NAME
            }))
        };
    }

    async resetPracticeDatabase() {
        await resetPracticeDatabase();
        return this.getSchema('practice_db');
    }

    async getDatabases(userId = null) {
        let query = `
            SELECT SCHEMA_NAME 
            FROM information_schema.SCHEMATA
            WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'auth_db', 'sql_db', 'challenge_db', 'analytics_db')
        `;
        const params = [];
        if (userId) {
            query += ` AND (SCHEMA_NAME = 'practice_db' OR SCHEMA_NAME LIKE ?)`;
            params.push(`user\\_${userId}\\__%`);
        }
        query += ` ORDER BY SCHEMA_NAME`;

        const [rows] = await practiceDb.query(query, params);
        
        return rows.map(r => {
            const name = r.SCHEMA_NAME;
            if (userId && name.startsWith(`user_${userId}_`)) {
                return name.replace(`user_${userId}_`, '');
            }
            return name;
        });
    }

    // Save history
    async logHistory(userId, sql, status, executionTimeMs) {
        const [result] = await appDb.query(
            'INSERT INTO query_history (user_id, query_text, status, execution_time_ms) VALUES (?, ?, ?, ?)',
            [userId, sql, status, executionTimeMs]
        );
        return result.insertId;
    }

    // Get History
    async getHistory(userId) {
        const [rows] = await appDb.query(
            'SELECT * FROM query_history WHERE user_id = ? ORDER BY executed_at DESC LIMIT 50',
            [userId]
        );
        return rows;
    }

    // Save query
    async saveQuery(userId, title, queryText, collection = 'Practice', notes = '') {
        await this.ensureSavedQuerySchema();

        const [result] = await appDb.query(
            'INSERT INTO saved_queries (user_id, title, query_text, collection, notes) VALUES (?, ?, ?, ?, ?)',
            [userId, title, queryText, collection, notes]
        );
        return result.insertId;
    }

    // Get saved queries
    async getSavedQueries(userId) {
        await this.ensureSavedQuerySchema();

        const [rows] = await appDb.query(
            'SELECT * FROM saved_queries WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    async updateSavedQuery(userId, id, data) {
        await this.ensureSavedQuerySchema();
        await appDb.query(
            'UPDATE saved_queries SET title = ?, query_text = ?, collection = ?, notes = ? WHERE id = ? AND user_id = ?',
            [data.title, data.query, data.collection, data.notes || '', id, userId]
        );
        return { id, ...data };
    }

    async deleteSavedQuery(userId, id) {
        await appDb.query('DELETE FROM saved_queries WHERE id = ? AND user_id = ?', [id, userId]);
        return { id };
    }

    async ensureSavedQuerySchema() {
        await this.addColumnIfMissing('saved_queries', 'collection', 'VARCHAR(50) DEFAULT "Practice"');
        await this.addColumnIfMissing('saved_queries', 'notes', 'TEXT');
        await this.addColumnIfMissing('saved_queries', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }

    async addColumnIfMissing(tableName, columnName, definition) {
        const [rows] = await appDb.query(`
            SELECT COUNT(*) AS column_count
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
        `, [tableName, columnName]);

        if (Number(rows[0]?.column_count || 0) === 0) {
            await appDb.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        }
    }

    mapFields(fields) {
        return fields.map(field => ({
            name: field.name,
            table: field.table,
            type: field.type,
            columnLength: field.columnLength,
            flags: field.flags,
            decimals: field.decimals
        }));
    }
}

export default new QueryRepository();
