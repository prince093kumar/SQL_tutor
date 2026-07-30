import sqlService from '../services/sqlService.js';

class SqlController {
    async execute(req, res) {
        try {
            const { query } = req.body;
            const userId = req.headers['x-user-id']; // Provided by Gateway

            if (!query) {
                return res.status(400).json({ error: 'SQL query is required' });
            }

            const data = await sqlService.executeQuery(userId, query);
            res.json({ message: 'Query executed successfully', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getHistory(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.getHistory(userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async save(req, res) {
        try {
            const { title, query } = req.body;
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.saveQuery(userId, title, query);
            res.status(201).json({ message: 'Query saved successfully', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSaved(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.getSavedQueries(userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SqlController();
