/**
 * 🧱 Rate Limiting Middleware
 * Protects against abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  skip: (req) => {
    // Skip preflight requests
    if (req.method === 'OPTIONS') {
      return true;
    }

    // Allow reminder settings updates to avoid 429 during editing/saving
    const reminderPath = /^\/(v1\/)?habits\/[a-f\d]{24}\/reminder$/.test(req.path);
    const reminderTestPath = /^\/(v1\/)?habits\/[a-f\d]{24}\/reminder\/test$/.test(req.path);
    if (reminderPath || reminderTestPath) {
      return true;
    }

    return false;
  },
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth routes rate limiter (more restrictive)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Habit creation rate limiter
 */
const habitCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 habit creation requests per 5 minutes
  message: {
    status: 'error',
    message: 'Too many habit creation attempts, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Speed limiter (slows down requests instead of blocking)
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: () => 500, // add 500ms delay per request after delayAfter (new behavior)
  maxDelayMs: 20000, // max delay of 20 seconds
  validate: {
    delayMs: false // Disable the deprecation warning
  }
});

/**
 * Email reminder test limiter
 */
const reminderTestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 reminder test requests per 10 minutes
  message: {
    status: 'error',
    message: 'Too many reminder test attempts, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  habitCreationLimiter,
  speedLimiter,
  reminderTestLimiter
};