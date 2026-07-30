import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
    async register(userData) {
        const { username, email, password } = userData;
        
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw new Error('Username already taken');
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const userId = await userRepository.create({
            username,
            email,
            password_hash
        });

        const token = this.generateToken(userId, username);

        return { user: { id: userId, username, email }, token };
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = this.generateToken(user.id, user.username);

        return { 
            user: { id: user.id, username: user.username, email: user.email }, 
            token 
        };
    }

    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    generateToken(id, username) {
        return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
}

export default new AuthService();
