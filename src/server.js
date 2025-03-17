const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.set('trust proxy', true);

app.use((req, res, next) => {
  // Get IP from various possible sources
  const userIp = 
    req.headers['x-forwarded-for'] || // Check if IP was forwarded
    req.headers['x-client-ip'] ||     // Some proxies use this
    req.headers['cf-connecting-ip'] || // Cloudflare
    req.connection.remoteAddress ||    // Direct connection
    req.socket.remoteAddress ||        // Socket connection
    req.ip;                           // Express built-in (if trust proxy is enabled)
  
  req.userIp = userIp;
  next();
});

// Routes (to be added)
app.get('/', (req, res) => {
  res.json({ message: 'Coupon Distribution API is running' });
});
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
