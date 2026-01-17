/**
 * 🧱 Habit Service Layer
 * Centralizes all habit-related business logic
 */

const Habit = require('../models/Habit');
const streakService = require('./streakService');
const analyticsService = require('./analyticsService');
const reminderService = require('./reminderService');

class HabitService {
  /**
   * Create a new habit
   * @param {Object} habitData - Habit creation data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created habit
   */
  async createHabit(habitData, userId) {
    try {
      const habit = await Habit.create({ 
        ...habitData, 
        userId, 
        completions: [] 
      });

      // Schedule reminder if enabled
      if (habit.reminderEnabled) {
        reminderService.scheduleHabitReminder(habit);
      }

      return habit;
    } catch (error) {
      throw new Error(`Failed to create habit: ${error.message}`);
    }
  }

  /**
   * Get all habits for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User habits
   */
  async getUserHabits(userId) {
    try {
      const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
      return habits;
    } catch (error) {
      throw new Error(`Failed to fetch habits: ${error.message}`);
    }
  }

  /**
   * Get habit by ID (with user authorization)
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Habit document
   */
  async getHabitById(habitId, userId) {
    try {
      const habit = await Habit.findOne({ _id: habitId, userId });
      if (!habit) {
        throw new Error('Habit not found');
      }
      return habit;
    } catch (error) {
      throw new Error(`Failed to fetch habit: ${error.message}`);
    }
  }

  /**
   * Update habit with business logic
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated habit
   */
  async updateHabit(habitId, userId, updateData) {
    try {
      const habit = await Habit.findOneAndUpdate(
        { _id: habitId, userId },
        updateData,
        { new: true }
      );

      if (!habit) {
        throw new Error('Habit not found');
      }

      // Update reminder schedule if reminder settings changed
      if (updateData.reminderEnabled !== undefined || 
          updateData.reminderTime || 
          updateData.reminderDays) {
        reminderService.updateHabitReminder(habit);
      }

      return habit;
    } catch (error) {
      throw new Error(`Failed to update habit: ${error.message}`);
    }
  }

  /**
   * Delete habit with cleanup
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteHabit(habitId, userId) {
    try {
      const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
      
      if (!habit) {
        throw new Error('Habit not found');
      }

      // Remove scheduled reminders
      reminderService.removeHabitReminder(habitId);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete habit: ${error.message}`);
    }
  }

  /**
   * Toggle habit completion with streak tracking
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @param {number} completionIndex - Completion index
   * @param {boolean} isCompleted - Completion status
   * @returns {Promise<Object>} Updated habit
   */
  async toggleCompletion(habitId, userId, completionIndex, isCompleted) {
    try {
      const habit = await this.getHabitById(habitId, userId);

      // Initialize completions array if needed
      if (!habit.completions) {
        habit.completions = [];
      }

      // Get tick boxes for index mapping
      const { generateTickBoxes } = require('../utils/tickBoxUtils');
      const tickBoxes = generateTickBoxes(habit.frequency, habit.completions);

      if (completionIndex < 0 || completionIndex >= tickBoxes.length) {
        throw new Error('Invalid completion index');
      }

      const targetTickBox = tickBoxes[completionIndex];
      const targetDate = new Date(targetTickBox.date);
      targetDate.setHours(0, 0, 0, 0);

      // Find or create completion entry
      const existingIndex = habit.completions.findIndex((c) => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === targetDate.getTime();
      });

      if (existingIndex >= 0) {
        habit.completions[existingIndex].isCompleted = isCompleted;
      } else {
        habit.completions.push({
          date: targetDate.toISOString(),
          isCompleted,
          label: targetTickBox.label,
        });
      }

      // Update streak tracking
      await streakService.updateHabitStreak(habit);

      await habit.save();
      return habit;
    } catch (error) {
      throw new Error(`Failed to toggle completion: ${error.message}`);
    }
  }

  /**
   * Get habit statistics
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Habit statistics
   */
  async getHabitStats(habitId, userId) {
    try {
      const habit = await this.getHabitById(habitId, userId);
      const stats = analyticsService.calculateHabitStats(habit);
      
      return {
        habitId: habit._id,
        habitName: habit.habitName,
        frequency: habit.frequency,
        ...stats
      };
    } catch (error) {
      throw new Error(`Failed to get habit stats: ${error.message}`);
    }
  }

  /**
   * Get habit streak information
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Streak information
   */
  async getHabitStreak(habitId, userId) {
    try {
      const habit = await this.getHabitById(habitId, userId);
      const streakData = streakService.calculateStreak(habit.completions, habit.frequency);
      const milestoneInfo = streakService.getStreakMilestone(streakData.currentStreak);

      return {
        habitId: habit._id,
        habitName: habit.habitName,
        frequency: habit.frequency,
        ...streakData,
        milestones: milestoneInfo
      };
    } catch (error) {
      throw new Error(`Failed to get habit streak: ${error.message}`);
    }
  }

  /**
   * Update habit reminder settings
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @param {Object} reminderData - Reminder settings
   * @returns {Promise<Object>} Updated reminder settings
   */
  async updateHabitReminder(habitId, userId, reminderData) {
    try {
      const habit = await Habit.findOneAndUpdate(
        { _id: habitId, userId },
        {
          reminderEnabled: reminderData.reminderEnabled !== undefined ? reminderData.reminderEnabled : undefined,
          reminderTime: reminderData.reminderTime || undefined,
          reminderDays: reminderData.reminderDays || undefined,
          reminderMessage: reminderData.reminderMessage || undefined
        },
        { new: true }
      );

      if (!habit) {
        throw new Error('Habit not found');
      }

      // Update reminder schedule
      reminderService.updateHabitReminder(habit);

      return {
        id: habit._id,
        reminderEnabled: habit.reminderEnabled,
        reminderTime: habit.reminderTime,
        reminderDays: habit.reminderDays,
        reminderMessage: habit.reminderMessage
      };
    } catch (error) {
      throw new Error(`Failed to update reminder: ${error.message}`);
    }
  }

  /**
   * Get dashboard summary for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Dashboard summary
   */
  async getDashboardSummary(userId) {
    try {
      const habits = await this.getUserHabits(userId);
      return analyticsService.getDashboardSummary(habits);
    } catch (error) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  /**
   * Test sending reminder for habit
   * @param {string} habitId - Habit ID
   * @param {string} userId - User ID
   * @param {string} customMessage - Optional custom message for test
   * @returns {Promise<void>}
   */
  async testHabitReminder(habitId, userId, customMessage) {
    try {
      const habit = await this.getHabitById(habitId, userId);
      await reminderService.testSendReminder(habit._id.toString(), customMessage);
    } catch (error) {
      throw new Error(`Failed to send test reminder: ${error.message}`);
    }
  }
}

module.exports = new HabitService();