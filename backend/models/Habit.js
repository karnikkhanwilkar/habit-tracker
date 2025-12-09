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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
