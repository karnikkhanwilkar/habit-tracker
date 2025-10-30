const { validationResult } = require('express-validator');
const Habit = require('../models/Habit');

exports.createHabit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user.id });
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
