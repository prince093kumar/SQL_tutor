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
            // Note: In a real implementation we would execute the query and compare results
            // Here we do a simple string match for MVP
            const normalizedExpected = challenge.expected_query.trim().toLowerCase();
            const normalizedQuery = queryText.trim().toLowerCase();
            
            if (normalizedQuery === normalizedExpected) {
                status = 'passed';
                isCorrect = true;
            }
            
        } catch (error) {
            status = 'error';
        }

        await challengeRepository.logSubmission(userId, challengeId, queryText, status, executionTimeMs);
        await challengeRepository.updateScore(userId, isCorrect);
        
        return { status, isCorrect };
    }

    async getLeaderboard() {
        return challengeRepository.getLeaderboard();
    }
}

export default new ChallengeService();
