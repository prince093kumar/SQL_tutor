import { appDb, practiceDb } from '../config/db.js';

class QueryRepository {
    // Execute raw SQL on the practice database
    async executeQuery(sql) {
        try {
            const [rows, fields] = await practiceDb.query(sql);
            return { rows, fields };
        } catch (error) {
            throw error;
        }
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
        // Query information_schema for tables and columns in sqllab_practice
        const [columns] = await appDb.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'practice_db'
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);
        return columns;
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
    async saveQuery(userId, title, queryText) {
        const [result] = await appDb.query(
            'INSERT INTO saved_queries (user_id, title, query_text) VALUES (?, ?, ?)',
            [userId, title, queryText]
        );
        return result.insertId;
    }

    // Get saved queries
    async getSavedQueries(userId) {
        const [rows] = await appDb.query(
            'SELECT * FROM saved_queries WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }
}

export default new QueryRepository();
