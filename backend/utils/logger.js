/**
 * 🧱 Logger Utility
 * Centralized logging for the application
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}\n`;
  }

  /**
   * Write to log file
   */
  writeToFile(filename, message) {
    try {
      fs.appendFileSync(filename, message);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    const logMessage = this.formatMessage('info', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  ${message}`, meta);
    }
    
    this.writeToFile(this.logFile, logMessage);
  }

  /**
   * Log error message
   */
  error(message, error = {}) {
    const meta = {
      stack: error.stack,
      message: error.message,
      ...error
    };
    
    const logMessage = this.formatMessage('error', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${message}`, error);
    }
    
    this.writeToFile(this.errorFile, logMessage);
    this.writeToFile(this.logFile, logMessage);
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    const logMessage = this.formatMessage('warn', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  ${message}`, meta);
    }
    
    this.writeToFile(this.logFile, logMessage);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, meta);
    }
  }

  /**
   * Log HTTP request
   */
  http(req, res) {
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode}`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };

    this.info(message, meta);
  }

  /**
   * Clean old log files (keep last 30 days)
   */
  cleanOldLogs() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    try {
      fs.readdir(logsDir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
          const filePath = path.join(logsDir, file);
          fs.stat(filePath, (statErr, stats) => {
            if (statErr) return;
            
            if (stats.mtime < thirtyDaysAgo) {
              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete old log file:', unlinkErr);
              });
            }
          });
        });
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }
}

// Clean old logs on startup
const logger = new Logger();
logger.cleanOldLogs();

module.exports = logger;