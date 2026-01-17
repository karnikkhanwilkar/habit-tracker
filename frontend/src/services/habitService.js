import { apiClient } from './authService';
import { getAuthHeader } from './helpers';

export const createHabit = async (habit, token) => {
  const res = await apiClient.post('/habits', habit, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

export const getHabits = async (token) => {
  const res = await apiClient.get('/habits', getAuthHeader(token));
  return res.data.data?.habits || [];
};

export const updateHabit = async (id, updates, token) => {
  const res = await apiClient.put(`/habits/${id}`, updates, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

export const deleteHabit = async (id, token) => {
  const res = await apiClient.delete(`/habits/${id}`, getAuthHeader(token));
  return res.data;
};

export const toggleHabitCompletion = async (habitId, completionIndex, isCompleted, token) => {
  const res = await apiClient.put(
    `/habits/${habitId}/completion/${completionIndex}`,
    { isCompleted },
    getAuthHeader(token)
  );
  return res.data.data?.habit || res.data;
};

// 🔥 Get streak information for a habit
export const getHabitStreak = async (habitId, token) => {
  const res = await apiClient.get(`/habits/${habitId}/streak`, getAuthHeader(token));
  return res.data.data || res.data;
};

// 📊 Get detailed statistics for a habit
export const getHabitStats = async (habitId, token) => {
  const res = await apiClient.get(`/habits/${habitId}/stats`, getAuthHeader(token));
  return res.data.data || res.data;
};

// 📊 Get dashboard summary statistics
export const getDashboardSummary = async (token) => {
  const res = await apiClient.get('/habits/dashboard/summary', getAuthHeader(token));
  return res.data.data || res.data;
};

// ⏰ Update reminder settings for a habit
export const updateHabitReminder = async (habitId, reminderData, token) => {
  const res = await apiClient.put(`/habits/${habitId}/reminder`, reminderData, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

// ⏰ Test sending a reminder email
export const testHabitReminder = async (habitId, token, customMessage) => {
  const payload = customMessage !== undefined ? { customMessage } : {};
  const res = await apiClient.post(`/habits/${habitId}/reminder/test`, payload, getAuthHeader(token));
  return res.data;
};
