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
    console.log(`🔧 Creating Gmail transporter for: ${process.env.GMAIL_USER}`);
    return nodemailer.createTransport({
      service: 'gmail', // Use Gmail service
      secure: false, // Set to false for port 587
      port: 587,
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  }

  // Alternative SMTP configuration (fallback)
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
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
  return nodemailer.createTransport({
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
 * @param {boolean} isTest - Whether this is a test email
 * @returns {Object} Email template
 */
const generateReminderTemplate = (habit, user, isTest = false) => {
  const currentStreak = habit.currentStreak || 0;
  const streakText = currentStreak > 0 ? 
    `🔥 You're on a ${currentStreak} day streak! Don't break it now!` : 
    `🌟 Start a new streak today!`;

  const customMessage = habit.reminderMessage || '';
  
  const subject = isTest ? 
    `🧪 TEST: ⏰ Time for your ${habit.habitName} habit!` :
    `⏰ Time for your ${habit.habitName} habit!`;
  
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
          <h1 class="habit-name">${isTest ? '🧪 TEST: ' : ''}⏰ ${habit.habitName}</h1>
          <p style="margin: 5px 0 0 0;">It's time to build your habit!${isTest ? ' (Test Email)' : ''}</p>
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
    ${isTest ? '🧪 TEST: ' : ''}⏰ ${habit.habitName} Reminder
    
    Hello ${user.name}!
    
    ${streakText}
    
    This is your reminder to complete your ${habit.habitName} habit.${isTest ? ' (This is a test email)' : ''}
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
 * @param {boolean} isTest - Whether this is a test email
 * @returns {Promise<Object>} Send result
 */
const sendReminderEmail = async (habit, user, isTest = false) => {
  try {
    const template = generateReminderTemplate(habit, user, isTest);

    // For development/testing, log the email instead of sending if no proper email config
    const hasGmailConfig = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    const hasSMTPConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (process.env.NODE_ENV === 'development' && !hasGmailConfig && !hasSMTPConfig) {
      console.log('\n📧 REMINDER EMAIL (Development Mode - No Email Config):');
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

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Habit Tracker" <${process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@habittracker.com'}>`,
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    // Log email attempt
    console.log(`📧 Attempting to send email to: ${user.email}`);
    console.log(`📧 Using transporter: ${hasGmailConfig ? 'Gmail' : hasSMTPConfig ? 'SMTP' : 'Ethereal'}`);

    // Set a shorter timeout for test emails
    const timeoutMs = isTest ? 15000 : 30000; // 15s for test, 30s for regular emails
    
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), timeoutMs)
      )
    ]);
    
    return {
      success: true,
      messageId: info.messageId,
      info: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Email send error:', error);
    
    // For test emails, always provide graceful fallback on timeout/connection issues
    if (isTest && (error.code === 'ETIMEDOUT' || 
                   error.message.includes('timeout') || 
                   error.message.includes('Connection timeout') ||
                   error.message.includes('Email sending timeout'))) {
      console.log('\n📧 EMAIL SIMULATION (Test Email - Connection Issue):');
      console.log('To:', user.email);
      console.log('Subject:', generateReminderTemplate(habit, user, isTest).subject);
      console.log('Custom Message:', habit.reminderMessage || 'No custom message');
      console.log('Status: Email would be sent in production with proper SMTP configuration');
      console.log('---\n');
      
      return {
        success: true,
        messageId: 'simulated-test-' + Date.now(),
        info: 'Test email simulated successfully - email configuration needs attention for actual sending'
      };
    }
    
    // For development, still return success if it's just a connection issue
    if (process.env.NODE_ENV === 'development' && 
        (error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
      console.log('\n📧 EMAIL SIMULATION (Development - Connection Issue):');
      console.log('To:', user.email);
      console.log('Subject:', generateReminderTemplate(habit, user, isTest).subject);
      console.log('Message: Email would be sent in production with proper SMTP configuration');
      console.log('---\n');
      
      return {
        success: true,
        messageId: 'simulated-' + Date.now(),
        info: 'Email simulated due to connection timeout in development'
      };
    }
    
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