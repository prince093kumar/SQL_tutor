import challengeRepository from '../repositories/challengeRepository.js';
import axios from 'axios';

class ChallengeService {
    async getChallenges() {
        return challengeRepository.getChallenges();
    }

    async getChallengeById(id) {
        return challengeRepository.getChallengeById(id);
    }

    async submitChallenge(userId, challengeId, queryText) {
        const challenge = await challengeRepository.getChallengeById(challengeId);
        if (!challenge) throw new Error('Challenge not found');

        let status = 'failed';
        let executionTimeMs = 0;
        let isCorrect = false;
        
        try {
            const sqlServiceUrl = process.env.SQL_SERVICE_URL || 'http://localhost:3002/api/v1/sql';
            
            // Execute user query
            const userRes = await axios.post(`${sqlServiceUrl}/execute`, { query: queryText }, { headers: { 'x-user-id': userId } });
            
            // Execute expected query
            const expectedRes = await axios.post(`${sqlServiceUrl}/execute`, { query: challenge.expected_query }, { headers: { 'x-user-id': userId } });
            
            executionTimeMs = userRes.data.data.executionTimeMs || 0;
            
            const userRows = userRes.data.data.rows;
            const expectedRows = expectedRes.data.data.rows;
            
            // Basic deep comparison of result sets
            if (JSON.stringify(userRows) === JSON.stringify(expectedRows)) {
                status = 'passed';
                isCorrect = true;
            }
            
        } catch (error) {
            status = 'error';
        }

        await challengeRepository.logSubmission(userId, challengeId, queryText, status, executionTimeMs);
        await challengeRepository.updateScore(userId, isCorrect);
        
        if (isCorrect) {
            const { pubsub, Events } = await import('@sqllab/shared');
            await pubsub.publish(Events.CHALLENGE_SOLVED, { userId, challengeId, isCorrect });
        }
        
        return { status, isCorrect };
    }

    async getLeaderboard() {
        return challengeRepository.getLeaderboard();
    }
}

export default new ChallengeService();
