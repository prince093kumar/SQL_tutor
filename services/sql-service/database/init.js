import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const practiceDatabase = process.env.DB_PRACTICE_NAME || 'practice_db';

const createConnection = async (database) => mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database,
    multipleStatements: true
});

const readSql = (fileName) => fs.readFileSync(path.join(__dirname, fileName), 'utf8');

const escapeIdentifier = (identifier) => `\`${String(identifier).replace(/`/g, '``')}\``;

export const initPracticeDatabase = async () => {
    const connection = await createConnection();
    try {
        await connection.query(readSql('schema.sql'));
        await connection.query(readSql('seed.sql'));
    } finally {
        await connection.end();
    }
};

export const resetPracticeDatabase = async () => {
    const connection = await createConnection(practiceDatabase);
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const [views] = await connection.query(`
            SELECT TABLE_NAME
            FROM information_schema.VIEWS
            WHERE TABLE_SCHEMA = DATABASE()
        `);
        for (const view of views) {
            await connection.query(`DROP VIEW IF EXISTS ${escapeIdentifier(view.TABLE_NAME)}`);
        }

        const [tables] = await connection.query(`
            SELECT TABLE_NAME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_TYPE = 'BASE TABLE'
        `);
        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS ${escapeIdentifier(table.TABLE_NAME)}`);
        }
    } finally {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.end();
    }

    await initPracticeDatabase();
};
