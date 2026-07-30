import analyticsRepository from '../repositories/analyticsRepository.js';
import { logger } from '@sqllab/shared';

class AnalyticsService {
    async handleChallengeSolved(payload) {
        const { userId, challengeId, isCorrect } = payload;
        if (!userId) return;
        
        logger.info(`Processing ChallengeSolved event for User ${userId}`);
        
        // Update daily progress
        const solvedInc = isCorrect ? 1 : 0;
        await analyticsRepository.updateDailyProgress(userId, solvedInc, 1);
        
        // Simple logic to award a badge
        if (isCorrect) {
            const stats = await analyticsRepository.getDashboardStats(userId);
            if (stats.totalChallengesSolved === 1) {
                await analyticsRepository.addAchievement(userId, 'First Challenge Solved');
                logger.info(`Awarded 'First Challenge Solved' badge to User ${userId}`);
            }
        }
    }

    async getDashboard(userId) {
        return analyticsRepository.getDashboardStats(userId);
    }
}

export default new AnalyticsService();
