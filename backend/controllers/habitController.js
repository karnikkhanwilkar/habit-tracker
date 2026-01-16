const { validationResult } = require('express-validator');
const habitService = require('../services/habitService');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * 🧱 Habit Controller - API v1
 * Handles HTTP requests and delegates to service layer
 */

exports.createHabit = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const habit = await habitService.createHabit(req.body, req.user.id);
  
  res.status(201).json({
    status: 'success',
    data: { habit }
  });
});

exports.getHabits = catchAsync(async (req, res, next) => {
  const habits = await habitService.getUserHabits(req.user.id);
  
  res.status(200).json({
    status: 'success',
    results: habits.length,
    data: { habits }
  });
});

exports.updateHabit = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const habit = await habitService.updateHabit(req.params.id, req.user.id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: { habit }
  });
});

exports.deleteHabit = catchAsync(async (req, res, next) => {
  await habitService.deleteHabit(req.params.id, req.user.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.toggleCompletion = catchAsync(async (req, res, next) => {
  const { isCompleted } = req.body;
  const { habitId, completionIndex } = req.params;

  const habit = await habitService.toggleCompletion(
    habitId, 
    req.user.id, 
    parseInt(completionIndex), 
    isCompleted
  );

  res.status(200).json({
    status: 'success',
    data: { habit }
  });
});

exports.getHabitStreak = catchAsync(async (req, res, next) => {
  const streakData = await habitService.getHabitStreak(req.params.id, req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: streakData
  });
});

exports.getHabitStats = catchAsync(async (req, res, next) => {
  const stats = await habitService.getHabitStats(req.params.id, req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

exports.getDashboardSummary = catchAsync(async (req, res, next) => {
  const summary = await habitService.getDashboardSummary(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: summary
  });
});

exports.updateHabitReminder = catchAsync(async (req, res, next) => {
  const reminderData = await habitService.updateHabitReminder(
    req.params.id, 
    req.user.id, 
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Reminder settings updated',
    data: reminderData
  });
});

exports.testHabitReminder = catchAsync(async (req, res, next) => {
  await habitService.testHabitReminder(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Test reminder sent successfully'
  });
});
