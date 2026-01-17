/**
 * ⏰ Reminder Service
 * Handles scheduling and sending of habit reminders
 */

const cron = require('node-cron');
const Habit = require('../models/Habit');
const User = require('../models/User');
const emailService = require('./emailService');

// Store active cron jobs
const activeCronJobs = new Map();

/**
 * Convert time string (HH:MM) and days array to cron expression
 * @param {string} timeStr - Time in HH:MM format
 * @param {Array<number>} days - Array of weekdays (0-6, Sunday-Saturday)
 * @returns {string} Cron expression
 */
const createCronExpression = (timeStr, days) => {
  const [hour, minute] = timeStr.split(':').map(Number);
  
  // If no specific days, assume daily
  if (!days || days.length === 0) {
    return `${minute} ${hour} * * *`;
  }
  
  // Convert days array to cron format
  const dayStr = days.sort().join(',');
  return `${minute} ${hour} * * ${dayStr}`;
};

/**
 * Check if reminder should be sent today
 * @param {Object} habit - Habit object
 * @returns {boolean} Should send reminder
 */
const shouldSendReminderToday = (habit) => {
  if (!habit.reminderEnabled) return false;
  
  const today = new Date().getDay(); // 0-6, Sunday-Saturday
  
  // If no specific days set, send daily for daily habits
  if (!habit.reminderDays || habit.reminderDays.length === 0) {
    return habit.frequency === 'daily';
  }
  
  return habit.reminderDays.includes(today);
};

/**
 * Send reminder for a specific habit
 * @param {string} habitId - Habit ID
 */
const sendHabitReminder = async (habitId) => {
  try {
    const habit = await Habit.findById(habitId).populate('userId');
    
    if (!habit || !habit.reminderEnabled) {
      console.log(`Reminder skipped for habit ${habitId}: not found or disabled`);
      return;
    }

    if (!shouldSendReminderToday(habit)) {
      console.log(`Reminder skipped for habit ${habitId}: not scheduled for today`);
      return;
    }

    const user = await User.findById(habit.userId);
    if (!user) {
      console.log(`Reminder skipped for habit ${habitId}: user not found`);
      return;
    }

    // Check if already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (habit.lastReminderSent && 
        new Date(habit.lastReminderSent) >= today) {
      console.log(`Reminder already sent today for habit ${habitId}`);
      return;
    }

    // Check if habit is already completed today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCompletion = habit.completions.find(c => 
      new Date(c.date).toISOString().split('T')[0] === todayStr && c.isCompleted
    );

    if (todayCompletion) {
      console.log(`Reminder skipped for habit ${habitId}: already completed today`);
      return;
    }

    // Send the email
    console.log(`Sending reminder for habit: ${habit.habitName} to ${user.email}`);
    const result = await emailService.sendReminderEmail(habit, user);

    if (result.success) {
      // Update last reminder sent date
      habit.lastReminderSent = new Date();
      await habit.save();
      console.log(`✅ Reminder sent successfully for habit: ${habit.habitName}`);
    } else {
      console.error(`❌ Failed to send reminder for habit: ${habit.habitName}`, result.error);
    }

  } catch (error) {
    console.error(`Error sending reminder for habit ${habitId}:`, error);
  }
};

/**
 * Schedule reminder for a habit
 * @param {Object} habit - Habit object
 */
const scheduleHabitReminder = (habit) => {
  if (!habit.reminderEnabled || !habit.reminderTime) {
    return;
  }

  try {
    const cronExpression = createCronExpression(habit.reminderTime, habit.reminderDays);
    console.log(`Scheduling reminder for habit ${habit.habitName}: ${cronExpression}`);

    const task = cron.schedule(cronExpression, () => {
      sendHabitReminder(habit._id.toString());
    }, {
      scheduled: false,
      name: `habit-${habit._id}`,
      timezone: 'America/New_York' // You can make this configurable per user
    });

    // Store the task for later management
    activeCronJobs.set(habit._id.toString(), task);
    
    // Start the task
    task.start();

    return task;
  } catch (error) {
    console.error(`Error scheduling reminder for habit ${habit.habitName}:`, error);
    return null;
  }
};

/**
 * Remove scheduled reminder for a habit
 * @param {string} habitId - Habit ID
 */
const removeHabitReminder = (habitId) => {
  const task = activeCronJobs.get(habitId);
  if (task) {
    task.stop();
    activeCronJobs.delete(habitId);
    console.log(`Removed scheduled reminder for habit ${habitId}`);
  }
};

/**
 * Initialize reminders for all habits with reminders enabled
 */
const initializeAllReminders = async () => {
  try {
    console.log('🔄 Initializing habit reminders...');
    
    const habitsWithReminders = await Habit.find({ 
      reminderEnabled: true 
    }).populate('userId');

    console.log(`Found ${habitsWithReminders.length} habits with reminders enabled`);

    for (const habit of habitsWithReminders) {
      if (habit.userId && !habit.userId.isAdmin) {
        scheduleHabitReminder(habit);
      }
    }

    console.log(`✅ Initialized reminders for ${activeCronJobs.size} habits`);
  } catch (error) {
    console.error('Error initializing reminders:', error);
  }
};

/**
 * Update reminder schedule for a habit
 * @param {Object} habit - Updated habit object
 */
const updateHabitReminder = (habit) => {
  const habitId = habit._id.toString();
  
  // Remove existing reminder
  removeHabitReminder(habitId);
  
  // Schedule new reminder if enabled
  if (habit.reminderEnabled) {
    scheduleHabitReminder(habit);
  }
};

/**
 * Get all active reminder jobs info
 * @returns {Array} Array of active job info
 */
const getActiveReminderJobs = () => {
  return Array.from(activeCronJobs.entries()).map(([habitId, task]) => ({
    habitId,
    running: task.running,
    name: task.name
  }));
};

/**
 * Test sending a reminder immediately (for testing)
 * @param {string} habitId - Habit ID
 * @param {string} customMessage - Optional custom message for test
 */
const testSendReminder = async (habitId, customMessage) => {
  try {
    const habit = await Habit.findById(habitId).populate('userId');
    
    if (!habit) {
      throw new Error('Habit not found');
    }

    const user = await User.findById(habit.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create temporary habit with custom message if provided
    let testHabit = habit;
    if (customMessage !== undefined && customMessage !== null) {
      testHabit = {
        ...habit.toObject(),
        reminderMessage: customMessage
      };
    }

    console.log(`Sending TEST reminder for habit: ${testHabit.habitName} to ${user.email}`);
    const result = await emailService.sendReminderEmail(testHabit, user, true);

    if (result.success) {
      console.log(`✅ Test reminder sent successfully for habit: ${testHabit.habitName}`);
    } else {
      console.error(`❌ Failed to send test reminder for habit: ${testHabit.habitName}`, result.error);
      throw new Error(result.error || 'Failed to send test email');
    }

    return result;
  } catch (error) {
    console.error(`Error sending test reminder for habit ${habitId}:`, error);
    throw error;
  }
};

module.exports = {
  scheduleHabitReminder,
  removeHabitReminder,
  updateHabitReminder,
  initializeAllReminders,
  sendHabitReminder,
  testSendReminder,
  getActiveReminderJobs,
  shouldSendReminderToday
};