import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlController from './controllers/sqlController.js';
import { initPracticeDatabase } from '../database/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'sql-service' });
});

const router = express.Router();
router.post('/execute', sqlController.execute.bind(sqlController));
router.get('/history', sqlController.getHistory.bind(sqlController));
router.post('/save', sqlController.save.bind(sqlController));
router.get('/saved', sqlController.getSaved.bind(sqlController));
router.put('/saved/:id', sqlController.updateSaved.bind(sqlController));
router.delete('/saved/:id', sqlController.deleteSaved.bind(sqlController));
router.get('/autocomplete', sqlController.getAutocomplete.bind(sqlController));
router.get('/schema', sqlController.getSchema.bind(sqlController));
router.get('/schema/graph', sqlController.getSchemaGraph.bind(sqlController));
router.post('/analyze', sqlController.analyze.bind(sqlController));
router.post('/reset', sqlController.reset.bind(sqlController));

app.use('/api/v1/sql', router);
app.get('/api/v1/saved-queries', sqlController.getSaved.bind(sqlController));
app.post('/api/v1/saved-queries', sqlController.save.bind(sqlController));
app.put('/api/v1/saved-queries/:id', sqlController.updateSaved.bind(sqlController));
app.delete('/api/v1/saved-queries/:id', sqlController.deleteSaved.bind(sqlController));

try {
    await initPracticeDatabase();
    console.log('Practice database initialized');
} catch (error) {
    console.error('Failed to initialize practice database:', error.message);
}

app.listen(PORT, () => {
    console.log(`SQL service listening on port ${PORT}`);
});
