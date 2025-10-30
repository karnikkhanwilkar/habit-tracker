const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    habitName: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'custom'] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
