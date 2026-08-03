import analyticsRepository from '../repositories/analyticsRepository.js';
import { logger } from '@sqllab/shared';

class AnalyticsService {
    async handleChallengeSolved(payload) {
        const { userId, isCorrect } = payload;
        if (!userId) return;
        
        logger.info(`Processing ChallengeSolved event for User ${userId}`);
        
        // Update daily progress
        const solvedInc = isCorrect ? 1 : 0;
        await analyticsRepository.updateDailyProgress(userId, solvedInc, 1);
        
    }

    async getDashboard(userId) {
        return analyticsRepository.getDashboardStats(userId);
    }
}

export default new AnalyticsService();
