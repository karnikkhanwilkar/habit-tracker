/**
 * 🚀 Database Optimization - Indexes and Performance
 * Adds database indexes for improved query performance
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Create database indexes for optimal performance
 */
const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    // User collection indexes
    const userCollection = mongoose.connection.collection('users');
    await userCollection.createIndex({ email: 1 }, { unique: true, background: true });
    await userCollection.createIndex({ createdAt: -1 }, { background: true });
    logger.info('✅ User indexes created');

    // Habit collection indexes
    const habitCollection = mongoose.connection.collection('habits');
    
    // Primary queries - user habits
    await habitCollection.createIndex({ userId: 1, createdAt: -1 }, { background: true });
    
    // Streak tracking queries
    await habitCollection.createIndex({ userId: 1, currentStreak: -1 }, { background: true });
    await habitCollection.createIndex({ userId: 1, longestStreak: -1 }, { background: true });
    
    // Reminder queries
    await habitCollection.createIndex({ 
      userId: 1, 
      reminderEnabled: 1,
      reminderTime: 1 
    }, { background: true });
    
    // Analytics queries
    await habitCollection.createIndex({ userId: 1, frequency: 1 }, { background: true });
    
    // Completion data optimization
    await habitCollection.createIndex({ 
      userId: 1, 
      'completions.date': -1 
    }, { background: true });

    logger.info('✅ Habit indexes created');
    logger.info('🚀 Database optimization complete');

  } catch (error) {
    logger.error('❌ Database index creation failed:', error);
    throw error;
  }
};

/**
 * Get database performance statistics
 */
const getDbStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      database: db.databaseName,
      collections: stats.collections,
      objects: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return null;
  }
};

/**
 * Analyze query performance for habits
 */
const analyzeQueryPerformance = async () => {
  try {
    const habitCollection = mongoose.connection.collection('habits');
    
    // Test common queries
    const queries = [
      { query: { userId: new mongoose.Types.ObjectId() }, name: 'User Habits Query' },
      { query: { userId: new mongoose.Types.ObjectId(), reminderEnabled: true }, name: 'Reminder Query' },
      { query: { userId: new mongoose.Types.ObjectId(), currentStreak: { $gt: 0 } }, name: 'Streak Query' }
    ];

    const results = [];
    
    for (const test of queries) {
      const explain = await habitCollection.find(test.query).explain('executionStats');
      results.push({
        query: test.name,
        executionTimeMs: explain.executionStats.executionTimeMillis,
        docsExamined: explain.executionStats.totalDocsExamined,
        docsReturned: explain.executionStats.totalDocsReturned,
        indexUsed: explain.executionStats.winningPlan?.inputStage?.indexName || 'collection scan'
      });
    }

    return results;
  } catch (error) {
    logger.error('Query performance analysis failed:', error);
    return null;
  }
};

module.exports = {
  createIndexes,
  getDbStats,
  analyzeQueryPerformance
};