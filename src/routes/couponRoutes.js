const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middleware/auth');
const { claimRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/claim', claimRateLimiter, couponController.claimCoupon);

// Admin routes
router.get('/', authMiddleware, couponController.getAllCoupons);
router.post('/', authMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, couponController.deleteCoupon);

module.exports = router;
