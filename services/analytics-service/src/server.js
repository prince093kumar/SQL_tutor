import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from '@sqllab/shared';
import { setupEventConsumers } from './events/consumer.js';
import analyticsController from './controllers/analyticsController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'analytics-service' });
});

const router = express.Router();
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));

app.use('/api/v1/analytics', router);

app.listen(PORT, async () => {
    logger.info(`Analytics service listening on port ${PORT}`);
    await setupEventConsumers();
});
