import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const signup = async (data) => {
  const res = await axios.post(`${API_URL}/auth/signup`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};
