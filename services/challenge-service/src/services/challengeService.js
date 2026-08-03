import challengeRepository from '../repositories/challengeRepository.js';
import axios from 'axios';
import { MaxHeap, PriorityQueue } from '../../../../packages/algorithms/index.js';

class ChallengeService {
    async getChallenges(filters = {}, userId = null) {
        return challengeRepository.getChallenges(filters, userId);
    }

    async getChallengeById(id) {
        return challengeRepository.getChallengeById(id);
    }

    async getCategories() {
        const challenges = await this.getChallenges();
        const grouped = challenges.reduce((acc, challenge) => {
            const category = challenge.category || 'Basics';
            if (!acc[category]) acc[category] = new Set();
            acc[category].add(challenge.topic || 'SELECT');
            return acc;
        }, {});

        return Object.entries(grouped).map(([name, topics]) => ({
            name,
            topics: Array.from(topics)
        }));
    }

    async getDifficulties() {
        return ['easy', 'medium', 'hard'];
    }

    async runChallenge(userId, challengeId, queryText) {
        const challenge = await challengeRepository.getChallengeById(challengeId);
        if (!challenge) throw new Error('Challenge not found');

        const sqlServiceUrl = process.env.SQL_SERVICE_URL || 'http://localhost:3002/api/v1/sql';
        
        // Execute user query
        const userRes = await axios.post(
            `${sqlServiceUrl}/execute`,
            { query: queryText },
            {
                headers: { 'x-user-id': userId },
                validateStatus: statusCode => statusCode < 500
            }
        );
        const data = userRes.data;

        if (!data.success) {
            return {
                success: false,
                rows: [],
                fields: [],
                executionTimeMs: data.executionTimeMs || data.executionTime || 0,
                rowCount: 0,
                sampleTests: [{ name: 'Sample Case 1', status: 'failed' }],
                error: data.error
            };
        }

        // Execute expected query for comparison
        let isCorrect = false;
        try {
            const expectedRes = await axios.post(`${sqlServiceUrl}/execute`, { query: challenge.expected_query }, {
                headers: { 'x-user-id': userId },
                validateStatus: statusCode => statusCode < 500
            });
            
            if (expectedRes.data.success) {
                const userRows = data.rows || [];
                const expectedRows = expectedRes.data.rows || [];
                isCorrect = JSON.stringify(userRows) === JSON.stringify(expectedRows);
            }
        } catch (error) {
            console.error("Failed to run expected query:", error);
        }

        return {
            success: true,
            rows: data.rows || [],
            fields: data.fields || [],
            executionTimeMs: data.executionTimeMs || data.executionTime || 0,
            rowCount: data.rowCount || 0,
            sampleTests: isCorrect
                ? [{ name: 'Sample Case 1', status: 'passed' }, { name: 'Sample Case 2', status: 'passed' }]
                : [{ name: 'Sample Case 1', status: 'failed' }],
            error: null
        };
    }

    async submitChallenge(userId, challengeId, queryText) {
        const challenge = await challengeRepository.getChallengeById(challengeId);
        if (!challenge) throw new Error('Challenge not found');

        let status = 'failed';
        let executionTimeMs = 0;
        let isCorrect = false;
        let error = null;
        
        try {
            const sqlServiceUrl = process.env.SQL_SERVICE_URL || 'http://localhost:3002/api/v1/sql';
            
            // Execute user query
            const userRes = await axios.post(`${sqlServiceUrl}/execute`, { query: queryText }, {
                headers: { 'x-user-id': userId },
                validateStatus: statusCode => statusCode < 500
            });
            if (!userRes.data.success) {
                throw new Error(userRes.data.error?.message || userRes.data.error || 'User query failed');
            }
            
            // Execute expected query
            const expectedRes = await axios.post(`${sqlServiceUrl}/execute`, { query: challenge.expected_query }, {
                headers: { 'x-user-id': userId },
                validateStatus: statusCode => statusCode < 500
            });
            if (!expectedRes.data.success) {
                throw new Error(expectedRes.data.error?.message || expectedRes.data.error || 'Expected query failed');
            }
            
            executionTimeMs = userRes.data.executionTimeMs || 0;
            
            const userRows = userRes.data.rows;
            const expectedRows = expectedRes.data.rows;
            
            // Basic deep comparison of result sets
            if (JSON.stringify(userRows) === JSON.stringify(expectedRows)) {
                status = 'passed';
                isCorrect = true;
            }
            
        } catch (submitError) {
            status = 'error';
            error = submitError.message;
        }

        await challengeRepository.logSubmission(userId, challengeId, queryText, status, executionTimeMs);
        await challengeRepository.updateScore(userId, isCorrect);
        
        if (isCorrect) {
            const { pubsub, Events } = await import('@sqllab/shared');
            await pubsub.publish(Events.CHALLENGE_SOLVED, { userId, challengeId, isCorrect });
        }
        
        return {
            status,
            isCorrect,
            hiddenTests: isCorrect
                ? [{ name: 'Hidden Case 1', status: 'passed' }, { name: 'Hidden Case 2', status: 'passed' }]
                : [{ name: 'Hidden Case 1', status: 'failed' }],
            xpEarned: isCorrect ? challenge.xp || 10 : 0,
            executionTimeMs,
            error
        };
    }

    async getLeaderboard() {
        const rows = await challengeRepository.getLeaderboardCandidates();
        const heap = new MaxHeap(user => {
            const score = Number(user.total_score || 0);
            const completedBonus = Number(user.challenges_completed || 0) * 5;
            return score + completedBonus;
        });

        rows.forEach(row => heap.insert(row));
        return heap.top(10).map((user, index) => ({
            ...user,
            rank: index + 1,
            rankingScore: Number(user.total_score || 0) + Number(user.challenges_completed || 0) * 5
        }));
    }

    async getRecommendedChallenges(userId, limit = 5) {
        const challenges = await this.getChallenges({}, userId);
        const weakTopics = await challengeRepository.getWeakTopics(userId);
        const weakTopicWeights = new Map(weakTopics.map(topic => [topic.topic, topic.weight]));
        const queue = new PriorityQueue(item => item.priority);

        challenges.forEach(challenge => {
            const weakTopicWeight = weakTopicWeights.get(challenge.topic) || weakTopicWeights.get(challenge.category) || 0;
            const difficultySuitability = challenge.difficulty === 'easy' ? 2 : challenge.difficulty === 'medium' ? 4 : 1;
            const unfinishedWeight = challenge.status === 'Solved' ? 0 : 3;
            const recencyWeight = Number(challenge.id || 0) / 100;
            const priority = weakTopicWeight + difficultySuitability + unfinishedWeight + recencyWeight;

            queue.enqueue({
                ...challenge,
                priority: Number(priority.toFixed(2)),
                reason: weakTopicWeight > 0 ? `Practice ${challenge.topic}` : 'Good next challenge'
            });
        });

        return queue.toArray(Number(limit) || 5);
    }

    async toggleBookmark(userId, challengeId) {
        return challengeRepository.toggleBookmark(userId, challengeId);
    }

    async getProfileStats(userId) {
        return challengeRepository.getProfileStats(userId);
    }

    async globalSearch(query, userId) {
        return challengeRepository.globalSearch(query, userId);
    }
}

export default new ChallengeService();
