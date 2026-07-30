import { pubsub, Events, logger } from '@sqllab/shared';
import analyticsService from '../services/analyticsService.js';

export async function setupEventConsumers() {
    await pubsub.subscribe(Events.CHALLENGE_SOLVED, async (payload) => {
        try {
            await analyticsService.handleChallengeSolved(payload);
        } catch (error) {
            logger.error(`Error handling ${Events.CHALLENGE_SOLVED}:`, error);
        }
    });
}
