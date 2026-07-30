import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlController from './controllers/sqlController.js';

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
router.get('/autocomplete', sqlController.getAutocomplete.bind(sqlController));
router.get('/schema', sqlController.getSchema.bind(sqlController));

app.use('/api/v1/sql', router);

app.listen(PORT, () => {
    console.log(`SQL service listening on port ${PORT}`);
});
