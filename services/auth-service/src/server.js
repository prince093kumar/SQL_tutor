import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authController from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
});

const router = express.Router();
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/profile', authController.getProfile.bind(authController));

app.use('/api/v1/auth', router);

app.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}`);
});
