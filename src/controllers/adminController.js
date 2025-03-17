const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Claim = require('../models/Claim');
const Coupon = require('../models/Coupon');
const bcrypt = require('bcrypt');

// Admin login
exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt for username:', username);
      
      // Check if admin exists
      const admin = await Admin.findOne({ username });
      if (!admin) {
        console.log('Admin not found in database');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Admin found:', admin.username);
      
      // Check password
      const isMatch = await admin.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Create JWT
      const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      console.log('Login successful, token generated');
      
      res.status(200).json({
        message: 'Login successful',
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  };

// Get all claims with coupon details (admin only)
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('couponId', 'code description')
      .sort({ claimedAt: -1 });
    
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
};

// Get dashboard statistics (admin only)
exports.getStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const totalClaims = await Claim.countDocuments();
    
    // Claims in last 24 hours
    const last24HoursClaims = await Claim.countDocuments({
      claimedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Claims in last 7 days
    const last7DaysClaims = await Claim.countDocuments({
      claimedAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.status(200).json({
      totalCoupons,
      activeCoupons,
      totalClaims,
      last24HoursClaims,
      last7DaysClaims
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Create initial admin user (development only)
exports.createAdmin = async (req, res) => {
    try {
      
      const { username, password } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin with this username already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create admin
      const admin = new Admin({
        username,
        passwordHash
      });
      
      await admin.save();
      
      res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
  };
