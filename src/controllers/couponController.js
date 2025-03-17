const Coupon = require('../models/Coupon');
const Claim = require('../models/Claim');

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
};

// Create a new coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, description, isActive } = req.body;
    
    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon with this code already exists' });
    }
    
    const coupon = new Coupon({
      code,
      description,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Update a coupon (admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { code, description, isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    if (code) coupon.code = code;
    if (description) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;
    
    await coupon.save();
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Delete a coupon (admin only)
exports.deleteCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      
      // Instead of using remove(), use deleteOne()
      await Coupon.deleteOne({ _id: req.params.id });
      // Or you can use: await coupon.deleteOne();
      
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ message: 'Error deleting coupon', error: error.message });
    }
  };

// Claim a coupon (public)
exports.claimCoupon = async (req, res) => {
  const providedIp = req.body.userIp; // From frontend API call
  const detectedIp = req.userIp; 
  const ipAddress = providedIp || detectedIp;

  console.log('Provided IP:', providedIp);
  console.log('Detected IP1:', detectedIp);
  console.log('IP Address:', ipAddress);
  
  const browserFingerprint = req.cookies.fingerprint || req.headers['user-agent'];
  
  try {
    // Check for recent claims from same IP or browser
    const recentClaim = await Claim.findOne({
      $or: [
        { ipAddress, claimedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        { browserFingerprint, claimedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    });
    
    if (recentClaim) {
      return res.status(429).json({ 
        message: 'You have already claimed a coupon recently. Please try again later.' 
      });
    }
    
    // Find next available coupon (oldest one first - round robin)
    const coupon = await Coupon.findOne({ isActive: true }).sort({ _id: 1 });
    
    if (!coupon) {
      return res.status(404).json({ message: 'No coupons available at this time.' });
    }
    
    // Record the claim
    const claim = new Claim({
      couponId: coupon._id,
      ipAddress,
      browserFingerprint
    });
    
    await claim.save();
    
    // Return the coupon to the user
    return res.status(200).json({ 
      message: 'Coupon claimed successfully!',
      coupon: { code: coupon.code, description: coupon.description }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
