const User = require('../models/User');
const jwt = require('jsonwebtoken');
const calculateAge = require('../utils/calculateAge');

const jwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be configured');
  return 'finaura_jwt_secret_key_12345_dev';
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret(), {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, dateOfBirth, role, language } = req.body;

    if (!name || !email || !password || !dateOfBirth) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Validate Name constraints
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      res.status(400);
      throw new Error('Name must be between 2 and 50 characters');
    }
    if (!/^[a-zA-Z\s'\-\.]+$/.test(trimmedName)) {
      res.status(400);
      throw new Error('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
    }

    // Validate Password constraints
    if (password.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400);
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      res.status(400);
      throw new Error('Platform is restricted to users aged 13 and older');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      role: role || 'USER',
      language: language || 'en',
    });

    if (user) {
      // NOTE: Wallet initialization will be hooked in here during Phase 4
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        age,
        language: user.language,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const age = calculateAge(user.dateOfBirth);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        age,
        language: user.language,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = async (req, res, next) => {
  try {
    // JWT is stateless; client should delete the token.
    // We return a simple confirmation message.
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user; // populated by protect middleware
    const age = calculateAge(user.dateOfBirth);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dateOfBirth: user.dateOfBirth,
      age,
      language: user.language,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
