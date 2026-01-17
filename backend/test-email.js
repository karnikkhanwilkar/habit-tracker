/**
 * Email Configuration Test Script
 * Run this to test your email setup
 */

require('dotenv').config();
const emailService = require('./services/emailService');

const testEmailSetup = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
  console.log();

  // Test email configuration
  console.log('🔧 Testing Email Configuration...');
  const configTest = await emailService.testEmailConfig();
  
  if (configTest.success) {
    console.log('✅ Email configuration is valid');
  } else {
    console.log('❌ Email configuration failed:', configTest.message);
    return;
  }

  // Send test email
  console.log('\n📧 Sending Test Email...');
  
  const testHabit = {
    _id: 'test-habit-id',
    habitName: 'Test Email Habit',
    frequency: 'daily',
    currentStreak: 3,
    reminderMessage: 'This is a test email to verify your email configuration.'
  };

  const testUser = {
    name: 'Test User',
    email: process.env.GMAIL_USER // Send test email to the configured email
  };

  try {
    const result = await emailService.sendReminderEmail(testHabit, testUser);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Info:', result.info);
    } else {
      console.log('❌ Test email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
  }
};

// Run the test
testEmailSetup().then(() => {
  console.log('\n🏁 Email test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});