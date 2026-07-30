import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authMiddleware from './middleware/authMiddleware.js';
import rateLimiter from './middleware/rateLimiter.js';

const router = express.Router();

// Define service URLs (can be overridden by environment variables)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const SQL_SERVICE_URL = process.env.SQL_SERVICE_URL || 'http://localhost:3002';
const CHALLENGE_SERVICE_URL = process.env.CHALLENGE_SERVICE_URL || 'http://localhost:3003';

// Auth routes (Public)
router.use('/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/v1/auth/'
    }
}));

// SQL routes (Protected + Rate Limited)
router.use('/sql', authMiddleware, rateLimiter, createProxyMiddleware({
    target: SQL_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/v1/sql/'
    }
}));

// Challenge routes (Protected)
router.use('/challenges', authMiddleware, createProxyMiddleware({
    target: CHALLENGE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/v1/challenges/'
    }
}));

export default router;
