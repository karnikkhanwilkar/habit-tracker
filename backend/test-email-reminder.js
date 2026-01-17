/**
 * Test script for email reminder functionality
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const Habit = require('./models/Habit');
const User = require('./models/User');
const reminderService = require('./services/reminderService');

async function testEmailReminder() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a habit with reminders enabled
    const habitsWithReminders = await Habit.find({ reminderEnabled: true }).populate('userId');
    
    if (habitsWithReminders.length === 0) {
      console.log('❌ No habits with reminders found');
      return;
    }

    const testHabit = habitsWithReminders[0];
    console.log(`📧 Testing email reminder for habit: ${testHabit.habitName}`);
    console.log(`👤 User: ${testHabit.userId.email}`);

    // Test with custom message
    const customMessage = "This is a test of the custom message feature! 🚀";
    
    console.log('🧪 Sending test email with custom message...');
    await reminderService.testSendReminder(testHabit._id.toString(), customMessage);
    
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testEmailReminder();