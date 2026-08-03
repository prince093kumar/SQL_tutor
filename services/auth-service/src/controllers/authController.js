import authService from '../services/authService.js';

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required' });
            }
            const data = await authService.register({ username, email, password });
            res.status(201).json({ message: 'Registration successful', data });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const data = await authService.login(email, password);
            res.json({ message: 'Login successful', data });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.headers['x-user-id']; // Provided by Gateway
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await authService.getProfile(userId);
            res.json({ data: user });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { full_name, university } = req.body;
            const user = await authService.updateProfile(userId, { full_name, university });
            res.json({ message: 'Profile updated', data: user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new AuthController();
