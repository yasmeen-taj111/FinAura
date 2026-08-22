const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const learningRoutes = require('./routes/learningRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const goalRoutes = require('./routes/goalRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

// Body Parsers
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);

const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many assistant requests. Please wait a few minutes and try again.' },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/assistant', assistantLimiter, assistantRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuild, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ message: 'Welcome to FinAura API' }));
}

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
