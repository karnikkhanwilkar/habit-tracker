require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reminderService = require('./services/reminderService');
const { generalLimiter, authLimiter, speedLimiter } = require('./middleware/rateLimiter');

const app = express();

// Standard Middleware
app.use(cors({
  origin: function (origin, callback) {
    console.log('🔍 Checking CORS for origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:5173',
      'https://habit-tracker-taupe-eta.vercel.app', // Your specific Vercel domain
      process.env.FRONTEND_URL, // Environment variable for production frontend
    ];
    
    // Check if origin is allowed or matches hosting patterns
    const isAllowed = allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      /^https:\/\/.*\.netlify\.app$/.test(origin) ||
      /^https:\/\/.*\.railway\.app$/.test(origin) ||
      /^https:\/\/.*\.render\.com$/.test(origin);
    
    if (isAllowed) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add explicit preflight handler
app.options('*', cors());

// � Rate Limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);
app.use(speedLimiter);

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`📋 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`🌐 Origin: ${req.headers.origin || 'None'}`);
  console.log(`🔑 User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
  next();
});

app.use(express.json());

// DB
connectDB();

// API Routes (v1)
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/habits', require('./routes/habitRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// Backward compatibility routes (redirect to v1)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Habit Tracker API running',
    version: 'v1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Info
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Habit Tracker API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      habits: '/api/v1/habits',
      admin: '/api/v1/admin'
    }
  });
});

// Handle 404 for unmatched routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // ⏰ Initialize reminder system
  setTimeout(async () => {
    try {
      await reminderService.initializeAllReminders();
      console.log('✅ Reminder system initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize reminder system:', error);
    }
  }, 2000); // Wait 2 seconds for DB connection to stabilize
});
