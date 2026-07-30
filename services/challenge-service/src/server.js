import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'challenge-service' });
});

import challengeController from './controllers/challengeController.js';
const router = express.Router();

router.get('/', challengeController.getChallenges.bind(challengeController));
router.post('/submit', challengeController.submitChallenge.bind(challengeController));
router.get('/leaderboard', challengeController.getLeaderboard.bind(challengeController));

app.use('/api/v1/challenges', router);

app.listen(PORT, () => {
    console.log(`Challenge service listening on port ${PORT}`);
});
