const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  
  const { name, email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 409));
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = await User.create({ name, email, password: hashedPassword });
  const token = generateToken(user._id);
  
  logger.info(`New user registered: ${email}`);
  
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }
  
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }
  
  const token = generateToken(user._id);
  
  logger.info(`User logged in: ${email}`);
  
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});
