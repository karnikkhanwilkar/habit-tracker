/**
 * 📊 Analytics Service
 * Handles all statistics and analytics logic for habits
 */

/**
 * Calculate completion percentage for a habit
 * @param {Array} completions - Array of completion objects
 * @param {string} frequency - Habit frequency
 * @param {number} days - Number of days to look back (default 30)
 * @returns {number} Completion percentage
 */
const getCompletionPercentage = (completions, frequency, days = 30) => {
  if (!completions || completions.length === 0) return 0;

  const now = new Date();
  const lookbackDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  // Filter completions within lookback period
  const recentCompletions = completions.filter(c => 
    new Date(c.date) >= lookbackDate && new Date(c.date) <= now
  );

  if (recentCompletions.length === 0) return 0;

  const completed = recentCompletions.filter(c => c.isCompleted).length;
  return Math.round((completed / recentCompletions.length) * 100);
};

/**
 * Get weekly completion trends
 * @param {Array} completions - Array of completion objects
 * @param {number} weeks - Number of weeks to analyze (default 4)
 * @returns {Array} Weekly trend data
 */
const getWeeklyTrends = (completions, weeks = 4) => {
  const trends = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const weekCompletions = completions.filter(c => {
      const date = new Date(c.date);
      return date >= weekStart && date <= weekEnd;
    });

    const completed = weekCompletions.filter(c => c.isCompleted).length;
    const total = weekCompletions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    trends.push({
      week: `Week ${weeks - i}`,
      date: weekStart.toISOString().split('T')[0],
      completed,
      total,
      percentage,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
  }

  return trends;
};

/**
 * Get monthly performance data
 * @param {Array} completions - Array of completion objects
 * @param {number} months - Number of months to analyze (default 3)
 * @returns {Array} Monthly performance data
 */
const getMonthlyPerformance = (completions, months = 3) => {
  const performance = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthCompletions = completions.filter(c => {
      const date = new Date(c.date);
      return date >= monthStart && date <= monthEnd;
    });

    const completed = monthCompletions.filter(c => c.isCompleted).length;
    const total = monthCompletions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    performance.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      date: monthStart.toISOString().split('T')[0],
      completed,
      total,
      percentage,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString()
    });
  }

  return performance;
};

/**
 * Calculate habit statistics
 * @param {Object} habit - Habit document
 * @returns {Object} Comprehensive statistics
 */
const calculateHabitStats = (habit) => {
  const completions = habit.completions || [];
  const now = new Date();
  
  // Basic stats
  const totalDays = completions.length;
  const completedDays = completions.filter(c => c.isCompleted).length;
  const missedDays = totalDays - completedDays;
  const overallPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Time-based stats
  const last7Days = getCompletionPercentage(completions, habit.frequency, 7);
  const last30Days = getCompletionPercentage(completions, habit.frequency, 30);
  const weeklyTrends = getWeeklyTrends(completions, 4);
  const monthlyPerformance = getMonthlyPerformance(completions, 3);

  // Streak info
  const currentStreak = habit.currentStreak || 0;
  const longestStreak = habit.longestStreak || 0;
  const lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : null;

  // Best performing day of week (for daily habits)
  let bestDayOfWeek = null;
  if (habit.frequency === 'daily') {
    const dayStats = {};
    completions.forEach(c => {
      if (c.isCompleted) {
        const dayOfWeek = new Date(c.date).getDay();
        dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1;
      }
    });

    const bestDay = Object.keys(dayStats).reduce((a, b) => 
      dayStats[a] > dayStats[b] ? a : b, '0');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    bestDayOfWeek = days[parseInt(bestDay)];
  }

  return {
    overview: {
      totalDays,
      completedDays,
      missedDays,
      overallPercentage,
      currentStreak,
      longestStreak,
      lastCompleted,
      bestDayOfWeek
    },
    timeFrames: {
      last7Days,
      last30Days
    },
    trends: {
      weekly: weeklyTrends,
      monthly: monthlyPerformance
    },
    chartData: {
      completionTrend: weeklyTrends.map(w => ({
        name: w.week,
        completed: w.completed,
        total: w.total,
        percentage: w.percentage
      })),
      monthlyBars: monthlyPerformance.map(m => ({
        name: m.month,
        completed: m.completed,
        missed: m.total - m.completed,
        percentage: m.percentage
      }))
    }
  };
};

/**
 * Get dashboard summary statistics for all habits
 * @param {Array} habits - Array of habit documents
 * @returns {Object} Dashboard summary data
 */
const getDashboardSummary = (habits) => {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      activeStreaks: 0,
      completionToday: 0,
      averageCompletion: 0,
      topPerformers: []
    };
  }

  const today = new Date().toISOString().split('T')[0];
  let totalTodayCompletions = 0;
  let totalTodayHabits = 0;
  let activeStreaks = 0;
  let totalCompletion = 0;

  const habitStats = habits.map(habit => {
    const stats = calculateHabitStats(habit);
    
    // Check today's completion
    const todayCompletion = habit.completions.find(c => 
      new Date(c.date).toISOString().split('T')[0] === today
    );
    
    if (todayCompletion) {
      totalTodayHabits++;
      if (todayCompletion.isCompleted) {
        totalTodayCompletions++;
      }
    }

    // Count active streaks
    if ((habit.currentStreak || 0) > 0) {
      activeStreaks++;
    }

    // Calculate overall completion percentage
    totalCompletion += stats.overview.overallPercentage;

    return {
      id: habit._id,
      name: habit.habitName,
      completion: stats.overview.overallPercentage,
      streak: habit.currentStreak || 0
    };
  });

  const completionToday = totalTodayHabits > 0 ? 
    Math.round((totalTodayCompletions / totalTodayHabits) * 100) : 0;
  
  const averageCompletion = habits.length > 0 ? 
    Math.round(totalCompletion / habits.length) : 0;

  // Get top 3 performing habits
  const topPerformers = habitStats
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 3);

  return {
    totalHabits: habits.length,
    activeStreaks,
    completionToday,
    averageCompletion,
    topPerformers,
    habitStats
  };
};

module.exports = {
  calculateHabitStats,
  getDashboardSummary,
  getCompletionPercentage,
  getWeeklyTrends,
  getMonthlyPerformance
};