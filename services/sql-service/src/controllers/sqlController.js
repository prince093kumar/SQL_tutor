import sqlService from '../services/sqlService.js';

class SqlController {
    async execute(req, res) {
        try {
            let { query, database, queryBase64 } = req.body;
            if (queryBase64) {
                query = Buffer.from(queryBase64, 'base64').toString('utf8');
            }
            const userId = req.headers['x-user-id']; // Provided by Gateway

            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'QUERY_REQUIRED',
                        message: 'SQL query is required.',
                        hint: 'Enter a SQL statement before running.'
                    }
                });
            }

            const data = await sqlService.executeQuery(userId, query, database);
            if (!data.success) {
                return res.status(400).json(data);
            }
            res.json(data);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'EXECUTION_FAILED',
                    message: error.message,
                    hint: 'Try again or reset the practice database.'
                }
            });
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
            const { title, query, collection, notes } = req.body;
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.saveQuery(userId, title, query, collection, notes);
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

    async updateSaved(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.updateSavedQuery(userId, req.params.id, req.body);
            res.json({ message: 'Query updated successfully', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteSaved(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = await sqlService.deleteSavedQuery(userId, req.params.id);
            res.json({ message: 'Query deleted successfully', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAutocomplete(req, res) {
        try {
            const { prefix } = req.query;
            const data = await sqlService.getAutocompleteSuggestions(prefix);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSchema(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const data = await sqlService.getSchema(req.query.db, userId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSchemaGraph(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const data = await sqlService.getSchemaGraph(req.query.startTable, req.query.db, userId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async analyze(req, res) {
        try {
            let { query, database, queryBase64 } = req.body;
            if (queryBase64) {
                query = Buffer.from(queryBase64, 'base64').toString('utf8');
            }
            const userId = req.headers['x-user-id'];
            if (!query) {
                return res.status(400).json({ error: 'SQL query is required.' });
            }

            const data = await sqlService.analyzeQuery(query, database, userId);
            if (data.error) {
                return res.status(400).json(data);
            }
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDatabases(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const data = await sqlService.getDatabases(userId);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async reset(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const data = await sqlService.resetPracticeDatabase(userId);
            res.json({ message: 'Sandboxes reset successfully', ...data });
        } catch (error) {
            res.status(500).json({
                error: {
                    code: 'RESET_FAILED',
                    message: error.message,
                    hint: 'Check MySQL connectivity and database permissions.'
                }
            });
        }
    }
}
export default new SqlController();
