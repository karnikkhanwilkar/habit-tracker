import axios from 'axios';
import { getAuthHeader } from './helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const createHabit = async (habit, token) => {
  const res = await axios.post(`${API_URL}/habits`, habit, getAuthHeader(token));
  return res.data;
};

export const getHabits = async (token) => {
  const res = await axios.get(`${API_URL}/habits`, getAuthHeader(token));
  return res.data;
};

export const updateHabit = async (id, updates, token) => {
  const res = await axios.put(`${API_URL}/habits/${id}`, updates, getAuthHeader(token));
  return res.data;
};

export const deleteHabit = async (id, token) => {
  const res = await axios.delete(`${API_URL}/habits/${id}`, getAuthHeader(token));
  return res.data;
};
