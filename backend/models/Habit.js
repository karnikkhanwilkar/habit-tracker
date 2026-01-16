const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    habitName: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'custom'] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completions: [
      {
        date: { type: Date, required: true }, // ISO date string for daily, start of week for weekly, start of month for monthly
        isCompleted: { type: Boolean, default: false },
        label: { type: String }, // "2025-12-09", "Week 50", "December 2025"
      },
    ],
    // 🔥 Streak Tracking Fields
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastCompletedDate: { type: Date, default: null },
    streakStartDate: { type: Date, default: null },
    
    // ⏰ Reminder Settings
    reminderEnabled: { type: Boolean, default: false },
    reminderTime: { type: String, default: '09:00' }, // HH:MM format
    reminderDays: [{ type: Number, min: 0, max: 6 }], // 0-6 for Sunday-Saturday
    lastReminderSent: { type: Date, default: null },
    reminderMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
