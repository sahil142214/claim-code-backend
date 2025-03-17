const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Coupon = require('../models/Coupon');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample coupons
const coupons = [
  {
    code: 'SAVE10',
    description: '10% discount on all items',
    isActive: true
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on orders over $50',
    isActive: true
  },
  {
    code: 'WELCOME25',
    description: '25% off your first purchase',
    isActive: true
  },
  {
    code: 'HOLIDAY50',
    description: '50% off selected holiday items',
    isActive: true
  },
  {
    code: 'BUNDLE20',
    description: '20% off when you buy 2 or more items',
    isActive: true
  }
];

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Admin.deleteMany();
    await Coupon.deleteMany();
    
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', passwordHash });
    
    // Create coupons
    await Coupon.insertMany(coupons);
    
    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
