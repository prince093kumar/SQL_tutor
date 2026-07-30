import db from '../config/db.js';

class UserRepository {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await db.query('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async create(userData) {
        const { username, email, password_hash } = userData;
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );
        return result.insertId;
    }
}

export default new UserRepository();
