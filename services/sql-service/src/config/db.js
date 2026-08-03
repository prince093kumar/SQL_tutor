import mysql from 'mysql2';

// Pool for application data (saving queries, history)
const appPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sql_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Pool for executing practice queries
// In production, this should connect with a restricted user that only has access to the practice db
const practicePool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_PRACTICE_NAME || 'practice_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Allowed for shared image queries
});

export const appDb = appPool.promise();
export const practiceDb = practicePool.promise();
