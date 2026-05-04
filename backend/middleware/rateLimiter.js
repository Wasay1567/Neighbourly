const { rateLimit } = require('express-rate-limit');

const minuteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 300,
    message: (req, res) => {
        const seconds = Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000);
        return {
            status: 429,
            error: 'Too Many Requests',
            message: 'Per minute limit exceeded, please try again later.',
            retryAfterSeconds: seconds,
            availableAt: req.rateLimit.resetTime
        };
    },
    statusCode: 429,
    skipFailedRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

const dayLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 day
    limit: 10000,
    message: (req, res) => {
        const seconds = Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000);
        return {
            status: 429,
            error: 'Too Many Requests',
            message: 'Per day limit exceeded, please try again later.',
            retryAfterSeconds: seconds,
            availableAt: req.rateLimit.resetTime
        };
    },
    statusCode: 429,
    skipFailedRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { minuteLimiter, dayLimiter };

