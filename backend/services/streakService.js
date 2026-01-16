/**
 * 🔥 Streak Tracking Service
 * Handles all streak calculation logic for habits
 */

/**
 * Calculate the number of days between two dates
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {number} Number of days between dates
 */
const daysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get expected interval in days based on frequency
 * @param {string} frequency - 'daily', 'weekly', 'monthly'
 * @returns {number} Expected days between completions
 */
const getExpectedInterval = (frequency) => {
  switch (frequency) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'monthly': return 30; // Approximate for monthly habits
    default: return 1;
  }
};

/**
 * Calculate current streak based on completions and frequency
 * @param {Array} completions - Array of completion objects
 * @param {string} frequency - Habit frequency
 * @param {Date} currentDate - Current date for calculations
 * @returns {Object} Streak data
 */
const calculateStreak = (completions, frequency, currentDate = new Date()) => {
  if (!completions || completions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakStartDate: null,
      isStreakActive: false
    };
  }

  const expectedInterval = getExpectedInterval(frequency);
  
  // Sort completions by date (newest first)
  const sortedCompletions = completions
    .filter(c => c.isCompleted)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedCompletions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakStartDate: null,
      isStreakActive: false
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate = null;
  let streakStartDate = null;
  let isStreakActive = false;

  // Check if there's a recent completion to maintain streak
  const mostRecentCompletion = new Date(sortedCompletions[0].date);
  const daysSinceLastCompletion = daysDifference(mostRecentCompletion, currentDate);
  
  // Streak is active if last completion is within expected interval + 1 grace day
  isStreakActive = daysSinceLastCompletion <= expectedInterval + 1;
  
  if (isStreakActive) {
    lastCompletedDate = mostRecentCompletion;
    currentStreak = 1;
    streakStartDate = mostRecentCompletion;

    // Calculate consecutive completions
    for (let i = 1; i < sortedCompletions.length; i++) {
      const currentDate = new Date(sortedCompletions[i - 1].date);
      const prevDate = new Date(sortedCompletions[i].date);
      const gap = daysDifference(currentDate, prevDate);

      // Check if completions are consecutive within expected interval
      if (gap <= expectedInterval + 1) {
        currentStreak++;
        streakStartDate = prevDate;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak from all completions
  tempStreak = 1;
  let tempLongest = 1;
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const currentDate = new Date(sortedCompletions[i - 1].date);
    const prevDate = new Date(sortedCompletions[i].date);
    const gap = daysDifference(currentDate, prevDate);

    if (gap <= expectedInterval + 1) {
      tempStreak++;
      tempLongest = Math.max(tempLongest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(tempLongest, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
    streakStartDate,
    isStreakActive
  };
};

/**
 * Update habit streak data after completion toggle
 * @param {Object} habit - Habit document
 * @returns {Object} Updated streak data
 */
const updateHabitStreak = async (habit) => {
  const streakData = calculateStreak(habit.completions, habit.frequency);
  
  // Update habit with new streak data
  habit.currentStreak = streakData.currentStreak;
  habit.longestStreak = streakData.longestStreak;
  habit.lastCompletedDate = streakData.lastCompletedDate;
  habit.streakStartDate = streakData.streakStartDate;

  return streakData;
};

/**
 * Get streak milestone info
 * @param {number} streakCount 
 * @returns {Object} Milestone information
 */
const getStreakMilestone = (streakCount) => {
  const milestones = [
    { days: 7, emoji: '🔥', title: 'Week Warrior!' },
    { days: 14, emoji: '💪', title: 'Two Week Champion!' },
    { days: 30, emoji: '👑', title: 'Month Master!' },
    { days: 60, emoji: '🌟', title: 'Two Month Legend!' },
    { days: 100, emoji: '💎', title: 'Century Achiever!' },
    { days: 365, emoji: '🏆', title: 'Year Long Hero!' }
  ];

  const achievedMilestones = milestones.filter(m => streakCount >= m.days);
  const nextMilestone = milestones.find(m => streakCount < m.days);
  
  return {
    current: achievedMilestones[achievedMilestones.length - 1] || null,
    next: nextMilestone || null,
    isAtMilestone: achievedMilestones.some(m => m.days === streakCount)
  };
};

module.exports = {
  calculateStreak,
  updateHabitStreak,
  getStreakMilestone,
  daysDifference,
  getExpectedInterval
};