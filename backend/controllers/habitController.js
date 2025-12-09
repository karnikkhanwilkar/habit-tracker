const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');

exports.createHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user.id, completions: [] });
    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Toggle completion status for a specific tick box
 * Completion index maps to the generated tick box array (0-based)
 */
exports.toggleCompletion = async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const { habitId, completionIndex } = req.params;

    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Initialize completions array if it doesn't exist
    if (!habit.completions) {
      habit.completions = [];
    }

    // Get the generated tick boxes based on frequency to map the index to a date
    const { generateTickBoxes } = require('../utils/tickBoxUtils');
    const tickBoxes = generateTickBoxes(habit.frequency, habit.completions);

    if (completionIndex < 0 || completionIndex >= tickBoxes.length) {
      return res.status(400).json({ message: 'Invalid completion index' });
    }

    const targetTickBox = tickBoxes[completionIndex];
    const targetDate = new Date(targetTickBox.date);
    targetDate.setHours(0, 0, 0, 0);

    // Find existing completion entry
    const existingIndex = habit.completions.findIndex((c) => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate.getTime() === targetDate.getTime();
    });

    if (existingIndex >= 0) {
      // Update existing completion
      habit.completions[existingIndex].isCompleted = isCompleted;
    } else {
      // Create new completion entry
      habit.completions.push({
        date: targetDate.toISOString(),
        isCompleted,
        label: targetTickBox.label,
      });
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    console.error('Toggle completion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
