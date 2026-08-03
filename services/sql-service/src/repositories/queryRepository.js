import { appDb, practiceDb } from '../config/db.js';
import { resetPracticeDatabase } from '../../database/init.js';

class QueryRepository {
    // Execute raw SQL on the practice database
    async executeQuery(sql) {
        const [rows, fields] = await practiceDb.query(sql);
        const isRowResult = Array.isArray(rows);

        return {
            rows: isRowResult ? rows : [],
            fields: this.mapFields(fields || []),
            affectedRows: isRowResult ? 0 : rows.affectedRows ?? 0,
            insertId: isRowResult ? 0 : rows.insertId ?? 0,
            warningStatus: isRowResult ? 0 : rows.warningStatus ?? 0,
            raw: rows
        };
    }

    // Get execution plan
    async getExplainPlan(sql) {
        try {
            // MySQL 8 supports EXPLAIN FORMAT=JSON
            const [rows] = await practiceDb.query(`EXPLAIN FORMAT=JSON ${sql}`);
            return rows;
        } catch (error) {
            throw error; // Will be caught by service
        }
    }

    // Get schema info for ER Diagram
    async getSchema() {
        const [databaseRows] = await practiceDb.query('SELECT DATABASE() AS databaseName');
        const database = databaseRows[0]?.databaseName || process.env.DB_PRACTICE_NAME || 'practice_db';

        const [columns] = await practiceDb.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);
        const [views] = await practiceDb.query(`
            SELECT TABLE_NAME
            FROM information_schema.VIEWS
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);
        const [relationships] = await practiceDb.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        `);

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
            database,
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
        return this.getSchema();
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
