const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Habit = require('../models/Habit');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { getDbStats, analyzeQueryPerformance } = require('../config/dbOptimization');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const reminderService = require('../services/reminderService');

// Test email configuration and sending
router.post('/test-email', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  try {
    // Test email configuration
    const configTest = await emailService.testEmailConfig();
    
    if (!configTest.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Email configuration test failed',
        error: configTest.message
      });
    }

    // Send test email to admin user
    const testEmail = {
      _id: 'test-habit-id',
      habitName: 'Test Habit',
      frequency: 'daily',
      currentStreak: 5,
      reminderMessage: 'This is a test email from your Habit Tracker system.'
    };

    const testUser = {
      name: 'Admin Test',
      email: req.user.email // Send to the admin who requested the test
    };

    const result = await emailService.sendReminderEmail(testEmail, testUser);
    
    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Test email sent successfully',
        data: {
          configTest,
          emailResult: result,
          sentTo: testUser.email
        }
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Email test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email test failed',
      error: error.message
    });
  }
}));

// Test reminder for a specific habit
router.post('/test-reminder/:habitId', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  try {
    await reminderService.testSendReminder(req.params.habitId);
    res.status(200).json({
      status: 'success',
      message: 'Test reminder sent successfully'
    });
  } catch (error) {
    logger.error('Reminder test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test reminder',
      error: error.message
    });
  }
}));

// Get all users and their habits
router.get('/users', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  const users = await User.find({}, '-password');
  const habits = await Habit.find({});
  
  const userHabits = users.map(user => ({
    ...user.toObject(),
    habits: habits.filter(habit => habit.userId.toString() === user._id.toString())
  }));
  
  res.status(200).json({
    status: 'success',
    results: userHabits.length,
    data: { users: userHabits }
  });
}));

// Delete a user and their habits
router.delete('/users/:id', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return next(new AppError('User not found', 404));
  }
  
  await Habit.deleteMany({ userId: req.params.id });
  
  logger.info(`Admin deleted user: ${deletedUser.email}`);
  
  res.status(200).json({
    status: 'success',
    message: 'User and their habits deleted successfully'
  });
}));

// 🚀 System monitoring and performance metrics
router.get('/system/health', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  const dbStats = await getDbStats();
  const queryPerformance = await analyzeQueryPerformance();
  
  // Basic system health
  const systemHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2)}%`
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  };

  res.status(200).json({
    status: 'success',
    data: {
      system: systemHealth,
      database: dbStats,
      performance: queryPerformance
    }
  });
}));

// 📊 Get application statistics
router.get('/stats', authMiddleware, adminMiddleware, catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalHabits = await Habit.countDocuments();
  const activeHabits = await Habit.countDocuments({ 
    currentStreak: { $gt: 0 } 
  });
  const habitsWithReminders = await Habit.countDocuments({ 
    reminderEnabled: true 
  });

  // Recent activity
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  const recentHabits = await Habit.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers,
        totalHabits,
        activeHabits,
        habitsWithReminders
      },
      recent: {
        newUsersThisWeek: recentUsers,
        newHabitsThisWeek: recentHabits
      },
      engagement: {
        avgHabitsPerUser: totalUsers > 0 ? (totalHabits / totalUsers).toFixed(2) : 0,
        activeHabitsPercentage: totalHabits > 0 ? ((activeHabits / totalHabits) * 100).toFixed(2) : 0,
        reminderAdoptionRate: totalHabits > 0 ? ((habitsWithReminders / totalHabits) * 100).toFixed(2) : 0
      }
    }
  });
}));

module.exports = router;
