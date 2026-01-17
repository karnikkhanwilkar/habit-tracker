const express = require('express');
const { body, param } = require('express-validator');
const { reminderTestLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/authMiddleware');
const { createHabit, getHabits, updateHabit, deleteHabit, toggleCompletion, getHabitStreak, getHabitStats, getDashboardSummary, updateHabitReminder, testHabitReminder } = require('../controllers/habitController');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [
    body('habitName').notEmpty().withMessage('habitName is required'),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid frequency'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('progress must be 0-100'),
  ],
  createHabit
);

router.get('/', getHabits);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid habit id'),
    body('habitName').optional().isString(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid frequency'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('progress must be 0-100'),
  ],
  updateHabit
);

router.put(
  '/:habitId/completion/:completionIndex',
  [
    param('habitId').isMongoId().withMessage('Invalid habit id'),
    param('completionIndex').isInt({ min: 0 }).withMessage('Invalid completion index'),
    body('isCompleted').isBoolean().withMessage('isCompleted must be boolean'),
  ],
  toggleCompletion
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid habit id')], deleteHabit);

// 🔥 Get streak information for a habit
router.get('/:id/streak', [param('id').isMongoId().withMessage('Invalid habit id')], getHabitStreak);

// 📊 Get detailed statistics for a habit
router.get('/:id/stats', [param('id').isMongoId().withMessage('Invalid habit id')], getHabitStats);

// 📊 Get dashboard summary statistics
router.get('/dashboard/summary', getDashboardSummary);

// ⏰ Update reminder settings for a habit
router.put('/:id/reminder', [
  param('id').isMongoId().withMessage('Invalid habit id'),
  body('reminderEnabled').optional().isBoolean().withMessage('reminderEnabled must be boolean'),
  body('reminderTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('reminderTime must be in HH:MM format'),
  body('reminderDays').optional().isArray().withMessage('reminderDays must be an array'),
  body('reminderDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('reminderDays must contain integers 0-6'),
  body('reminderMessage').optional().isString().withMessage('reminderMessage must be a string')
], updateHabitReminder);

// ⏰ Test sending a reminder email
router.post('/:id/reminder/test', reminderTestLimiter, [param('id').isMongoId().withMessage('Invalid habit id')], testHabitReminder);

module.exports = router;
