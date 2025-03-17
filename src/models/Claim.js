const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  couponId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Coupon', 
    required: true 
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  browserFingerprint: { 
    type: String, 
    required: true 
  },
  claimedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient querying by IP and browser fingerprint
ClaimSchema.index({ ipAddress: 1, claimedAt: -1 });
ClaimSchema.index({ browserFingerprint: 1, claimedAt: -1 });

module.exports = mongoose.model('Claim', ClaimSchema);
