const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Habit = require('../models/Habit');

// Get all users and their habits
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const habits = await Habit.find({});
    const userHabits = users.map(user => ({
      ...user.toObject(),
      habits: habits.filter(habit => habit.userId.toString() === user._id.toString())
    }));
    res.json(userHabits);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete a user and their habits
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Habit.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and their habits deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
