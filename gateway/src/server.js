
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import routes from './routes.js';

app.use(cors());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'gateway' });
});

app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log(`Gateway service listening on port ${PORT}`);
});
