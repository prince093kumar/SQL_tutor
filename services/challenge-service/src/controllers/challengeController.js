import challengeService from '../services/challengeService.js';

class ChallengeController {
    async getChallenges(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const data = await challengeService.getChallenges(req.query, userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getChallengeById(req, res) {
        try {
            const data = await challengeService.getChallengeById(req.params.id);
            if (!data) return res.status(404).json({ error: 'Challenge not found' });
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLatestSubmission(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await challengeService.getLatestSubmission(userId, req.params.id);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async runChallenge(req, res) {
        try {
            let { challengeId, queryText, queryBase64 } = req.body;
            if (queryBase64) {
                queryText = Buffer.from(queryBase64, 'base64').toString('utf8');
            }
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!challengeId || !queryText) {
                return res.status(400).json({ error: 'challengeId and queryText are required' });
            }

            const data = await challengeService.runChallenge(userId, challengeId, queryText);
            res.json({ message: 'Run completed', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async submitChallenge(req, res) {
        try {
            let { challengeId, queryText, queryBase64 } = req.body;
            if (queryBase64) {
                queryText = Buffer.from(queryBase64, 'base64').toString('utf8');
            }
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!challengeId || !queryText) {
                return res.status(400).json({ error: 'challengeId and queryText are required' });
            }
            
            const data = await challengeService.submitChallenge(userId, challengeId, queryText);
            res.json({ message: 'Submission processed', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const data = await challengeService.getLeaderboard();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRecommendedChallenges(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const data = await challengeService.getRecommendedChallenges(userId, req.query.limit);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async toggleBookmark(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const data = await challengeService.toggleBookmark(userId, req.params.id);
            res.json({ data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getProfileStats(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const data = await challengeService.getProfileStats(userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async globalSearch(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const data = await challengeService.globalSearch(req.query.q || '', userId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCategories(req, res) {
        try {
            const data = await challengeService.getCategories();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDifficulties(req, res) {
        try {
            const data = await challengeService.getDifficulties();
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ChallengeController();
