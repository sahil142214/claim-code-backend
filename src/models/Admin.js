const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords...');
  console.log('Stored hash:', this.passwordHash);
  console.log('Candidate password:', candidatePassword);
  const result = await bcrypt.compare(candidatePassword, this.passwordHash);
  console.log('bcrypt comparison result:', result);
  return result;
};

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  // Skip hashing if passwordHash hasn't been modified
  // This is causing issues because we're already hashing in the controller
  // Just pass through to avoid double-hashing
  return next();
});

module.exports = mongoose.model('Admin', AdminSchema);
