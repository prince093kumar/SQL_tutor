import db from '../config/db.js';

class AnalyticsRepository {
    async updateDailyProgress(userId, challengesSolvedInc, queriesRunInc) {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await db.query(`
            INSERT INTO daily_progress (user_id, date, challenges_solved, queries_run)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            challenges_solved = challenges_solved + ?,
            queries_run = queries_run + ?
        `, [userId, date, challengesSolvedInc, queriesRunInc, challengesSolvedInc, queriesRunInc]);
    }

    async addAchievement(userId, badgeName) {
        await db.query(`
            INSERT INTO achievements (user_id, badge_name)
            VALUES (?, ?)
        `, [userId, badgeName]);
    }

    async getDashboardStats(userId) {
        // Dummy implementation for MVP. In reality, we'd query multiple tables.
        const [progress] = await db.query(`SELECT SUM(challenges_solved) as total_challenges FROM daily_progress WHERE user_id = ?`, [userId]);
        const [badges] = await db.query(`SELECT COUNT(*) as total_badges FROM achievements WHERE user_id = ?`, [userId]);
        
        return {
            totalChallengesSolved: progress[0]?.total_challenges || 0,
            totalBadges: badges[0]?.total_badges || 0
        };
    }
}

export default new AnalyticsRepository();
