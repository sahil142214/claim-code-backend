const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// Public admin routes
router.post('/login', loginRateLimiter, adminController.login);

// Protected admin routes
router.get('/claims', authMiddleware, adminController.getAllClaims);
router.get('/stats', authMiddleware, adminController.getStats);

// Development only route to create admin
router.post('/create', adminController.createAdmin);

module.exports = router;
