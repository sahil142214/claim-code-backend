const rateLimit = require('express-rate-limit');

// Rate limiter for coupon claims - 1 per 24 hours per IP
const claimRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Limit each IP to 1 request per windowMs
  standardHeaders: true,
  message: { message: 'Too many claims from this IP, please try again later' }
});

// Rate limiter for login attempts - 5 per 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  message: { message: 'Too many login attempts, please try again later' }
});

module.exports = {
  claimRateLimiter,
  loginRateLimiter
};
