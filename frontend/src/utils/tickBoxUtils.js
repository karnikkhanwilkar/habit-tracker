/**
 * Utility functions for generating and managing habit tick boxes
 */

/**
 * Get the current date at midnight
 */
export const getTodayDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get the start of the current week (Monday)
 */
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

/**
 * Get the start of the current month
 */
export const getMonthStart = (date = new Date()) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDateShort = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get week number in year
 */
export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNum;
};

/**
 * Format month as "Month Year" (e.g., "December 2025")
 */
export const formatMonthName = (date) => {
  const options = { month: 'long', year: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

/**
 * Generate tick boxes for daily frequency
 * Returns array of completion objects for current day + next 29 days
 */
export const generateDailyTickBoxes = (existingCompletions = [], options = {}) => {
  const tickBoxes = [];
  const today = getTodayDate();
  const startDate = options.startDate ? new Date(options.startDate) : today;
  startDate.setHours(0, 0, 0, 0);
  const endDate = options.endDate
    ? new Date(options.endDate)
    : new Date(today.getTime() + (options.futureDays ?? 29) * 86400000);
  endDate.setHours(0, 0, 0, 0);

  // Generate tick boxes from start date to end date (inclusive)
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {

    const dateStr = formatDateShort(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const existing = existingCompletions.find(
      (c) => formatDateShort(new Date(c.date)) === dateStr
    );

    const isFuture = date > today;
    const isPast = date < today;
    const isMissed = isPast && !existing?.isCompleted;

    tickBoxes.push({
      date: date.toISOString(),
      label: dayName,
      isCompleted: existing ? existing.isCompleted : false,
      _id: existing?._id,
      isLocked: isFuture,
      isMissed,
    });
  }

  return tickBoxes;
};

/**
 * Generate tick boxes for weekly frequency
 * Returns array of completion objects for current week + next 11 weeks
 */
export const generateWeeklyTickBoxes = (existingCompletions = [], options = {}) => {
  const tickBoxes = [];
  const today = getTodayDate();
  const startDate = options.startDate ? getWeekStart(new Date(options.startDate)) : getWeekStart();
  const endDate = options.endDate
    ? getWeekStart(new Date(options.endDate))
    : new Date(getWeekStart().getTime() + (options.futureWeeks ?? 11) * 7 * 86400000);
  endDate.setHours(0, 0, 0, 0);

  // Generate weekly tick boxes from start to end (inclusive)
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 7)) {

    const weekNum = getWeekNumber(date);
    const year = date.getFullYear();
    const label = `Week ${weekNum}, ${year}`;

    const dateStr = formatDateShort(date);
    const existing = existingCompletions.find(
      (c) => formatDateShort(new Date(c.date)) === dateStr
    );

    const isFuture = date > today;
    const isPast = date < today;
    const isMissed = isPast && !existing?.isCompleted;

    tickBoxes.push({
      date: date.toISOString(),
      label,
      isCompleted: existing ? existing.isCompleted : false,
      _id: existing?._id,
      isLocked: isFuture,
      isMissed,
    });
  }

  return tickBoxes;
};

/**
 * Generate tick boxes for monthly frequency
 * Returns array of completion objects for current month + next 11 months
 */
export const generateMonthlyTickBoxes = (existingCompletions = [], options = {}) => {
  const tickBoxes = [];
  const today = getTodayDate();
  const startDate = options.startDate ? getMonthStart(new Date(options.startDate)) : getMonthStart();
  const endDate = options.endDate
    ? getMonthStart(new Date(options.endDate))
    : new Date(getMonthStart().getFullYear(), getMonthStart().getMonth() + (options.futureMonths ?? 11), 1);
  endDate.setHours(0, 0, 0, 0);

  // Generate monthly tick boxes from start to end (inclusive)
  for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {

    const label = formatMonthName(date);
    const dateStr = formatDateShort(date);
    const existing = existingCompletions.find(
      (c) => formatDateShort(new Date(c.date)) === dateStr
    );

    const isFuture = date > today;
    const isPast = date < today;
    const isMissed = isPast && !existing?.isCompleted;

    tickBoxes.push({
      date: date.toISOString(),
      label,
      isCompleted: existing ? existing.isCompleted : false,
      _id: existing?._id,
      isLocked: isFuture,
      isMissed,
    });
  }

  return tickBoxes;
};

/**
 * Generate tick boxes based on frequency
 */
export const generateTickBoxes = (frequency, existingCompletions = [], options = {}) => {
  switch (frequency) {
    case 'daily':
      return generateDailyTickBoxes(existingCompletions, options);
    case 'weekly':
      return generateWeeklyTickBoxes(existingCompletions, options);
    case 'monthly':
      return generateMonthlyTickBoxes(existingCompletions, options);
    default:
      return [];
  }
};
