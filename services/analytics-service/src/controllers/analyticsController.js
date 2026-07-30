import analyticsService from '../services/analyticsService.js';

class AnalyticsController {
    async getDashboard(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await analyticsService.getDashboard(userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new AnalyticsController();
