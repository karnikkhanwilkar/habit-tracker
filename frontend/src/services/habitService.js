import axios from 'axios';
import { getAuthHeader } from './helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const createHabit = async (habit, token) => {
  const res = await axios.post(`${API_URL}/habits`, habit, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

export const getHabits = async (token) => {
  const res = await axios.get(`${API_URL}/habits`, getAuthHeader(token));
  return res.data.data?.habits || [];
};

export const updateHabit = async (id, updates, token) => {
  const res = await axios.put(`${API_URL}/habits/${id}`, updates, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

export const deleteHabit = async (id, token) => {
  const res = await axios.delete(`${API_URL}/habits/${id}`, getAuthHeader(token));
  return res.data;
};

export const toggleHabitCompletion = async (habitId, completionIndex, isCompleted, token) => {
  const res = await axios.put(
    `${API_URL}/habits/${habitId}/completion/${completionIndex}`,
    { isCompleted },
    getAuthHeader(token)
  );
  return res.data.data?.habit || res.data;
};

// 🔥 Get streak information for a habit
export const getHabitStreak = async (habitId, token) => {
  const res = await axios.get(`${API_URL}/habits/${habitId}/streak`, getAuthHeader(token));
  return res.data.data || res.data;
};

// 📊 Get detailed statistics for a habit
export const getHabitStats = async (habitId, token) => {
  const res = await axios.get(`${API_URL}/habits/${habitId}/stats`, getAuthHeader(token));
  return res.data.data || res.data;
};

// 📊 Get dashboard summary statistics
export const getDashboardSummary = async (token) => {
  const res = await axios.get(`${API_URL}/habits/dashboard/summary`, getAuthHeader(token));
  return res.data.data || res.data;
};

// ⏰ Update reminder settings for a habit
export const updateHabitReminder = async (habitId, reminderData, token) => {
  const res = await axios.put(`${API_URL}/habits/${habitId}/reminder`, reminderData, getAuthHeader(token));
  return res.data.data?.habit || res.data;
};

// ⏰ Test sending a reminder email
export const testHabitReminder = async (habitId, token) => {
  const res = await axios.post(`${API_URL}/habits/${habitId}/reminder/test`, {}, getAuthHeader(token));
  return res.data;
};
