// Simple in-memory rate limiter for development if Redis is not available
// In a real production setup, we'd use redis.
const rateLimitMap = new Map();

const rateLimiter = (req, res, next) => {
    // For Phase 1 we will just log and allow, or use a basic in-memory map
    const ip = req.ip || req.connection.remoteAddress;
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    const currentTime = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: currentTime + windowMs });
        return next();
    }

    const requestData = rateLimitMap.get(ip);

    if (currentTime > requestData.resetTime) {
        // Reset window
        requestData.count = 1;
        requestData.resetTime = currentTime + windowMs;
        return next();
    }

    requestData.count++;

    if (requestData.count > maxRequests) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    next();
};

export default rateLimiter;
