import db from '../config/db.js';

class ChallengeRepository {
    async getChallenges() {
        const [rows] = await db.query('SELECT id, title, description, difficulty, created_at FROM challenges ORDER BY created_at DESC');
        return rows;
    }

    async getChallengeById(id) {
        const [rows] = await db.query('SELECT * FROM challenges WHERE id = ?', [id]);
        return rows[0];
    }

    async logSubmission(userId, challengeId, queryText, status, executionTimeMs) {
        const [result] = await db.query(
            'INSERT INTO submissions (user_id, challenge_id, query_text, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)',
            [userId, challengeId, queryText, status, executionTimeMs]
        );
        return result.insertId;
    }

    async updateScore(userId, isCorrect) {
        // Simple scoring: +10 per correct submission
        if (!isCorrect) return;
        
        await db.query(`
            INSERT INTO user_scores (user_id, total_score, challenges_completed)
            VALUES (?, 10, 1)
            ON DUPLICATE KEY UPDATE 
            total_score = total_score + 10,
            challenges_completed = challenges_completed + 1
        `, [userId]);
    }

    async getLeaderboard() {
        const [rows] = await db.query(`
            SELECT u.username, s.total_score, s.challenges_completed 
            FROM user_scores s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.total_score DESC
            LIMIT 10
        `);
        return rows;
    }
}

export default new ChallengeRepository();
