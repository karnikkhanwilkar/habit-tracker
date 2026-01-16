/**
 * ⏰ Email Service
 * Handles all email sending functionality for reminders
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter based on environment configuration
 */
const createTransporter = () => {
  // Gmail configuration (primary)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransporter({
      service: 'gmail', // Use Gmail service
      secure: true,
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
      }
    });
  }

  // Alternative SMTP configuration (fallback)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Development/Testing fallback - Ethereal Email
  console.log('⚠️  Using Ethereal email for testing. Configure Gmail in .env for production.');
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

/**
 * Generate reminder email template
 * @param {Object} habit - Habit object
 * @param {Object} user - User object
 * @returns {Object} Email template
 */
const generateReminderTemplate = (habit, user) => {
  const currentStreak = habit.currentStreak || 0;
  const streakText = currentStreak > 0 ? 
    `🔥 You're on a ${currentStreak} day streak! Don't break it now!` : 
    `🌟 Start a new streak today!`;

  const customMessage = habit.reminderMessage || '';
  
  const subject = `⏰ Time for your ${habit.habitName} habit!`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Habit Reminder</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 25px;
        }
        .habit-name {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .streak-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="habit-name">⏰ ${habit.habitName}</h1>
          <p style="margin: 5px 0 0 0;">It's time to build your habit!</p>
        </div>
        
        <div class="streak-info">
          <strong>${streakText}</strong>
        </div>
        
        <p>Hello ${user.name}!</p>
        
        <p>This is your friendly reminder to complete your <strong>${habit.habitName}</strong> habit. 
        ${habit.frequency === 'daily' ? 'Every day' : 'Regularly'} practicing this habit will help you build lasting positive changes.</p>
        
        ${customMessage ? `<p><em>"${customMessage}"</em></p>` : ''}
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta-button">
            Mark as Complete
          </a>
        </div>
        
        <div class="footer">
          <p>Sent with ❤️ from your Habit Tracker</p>
          <p style="font-size: 12px;">
            Don't want these reminders? 
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/habits/${habit._id}">Update your settings</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    ⏰ ${habit.habitName} Reminder
    
    Hello ${user.name}!
    
    ${streakText}
    
    This is your reminder to complete your ${habit.habitName} habit.
    ${customMessage ? `\n"${customMessage}"\n` : ''}
    
    Visit your dashboard to mark it as complete: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
    
    ---
    Sent from your Habit Tracker
  `;

  return {
    subject,
    html: htmlContent,
    text: textContent
  };
};

/**
 * Send reminder email
 * @param {Object} habit - Habit object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Send result
 */
const sendReminderEmail = async (habit, user) => {
  try {
    const transporter = createTransporter();
    const template = generateReminderTemplate(habit, user);

    const mailOptions = {
      from: `"Habit Tracker" <${process.env.EMAIL_FROM || 'noreply@habittracker.com'}>`,
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    // For development/testing, log the email instead of sending
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
      console.log('\n📧 REMINDER EMAIL (Development Mode):');
      console.log('To:', user.email);
      console.log('Subject:', template.subject);
      console.log('Content:', template.text);
      console.log('---\n');
      
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now(),
        info: 'Email logged to console (development mode)'
      };
    }

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      info: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  sendReminderEmail,
  testEmailConfig,
  generateReminderTemplate
};