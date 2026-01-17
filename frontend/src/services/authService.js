import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌐 Making API request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export const signup = async (data) => {
  const res = await apiClient.post('/auth/signup', data);
  return res.data;
};

export const login = async (data) => {
  const res = await apiClient.post('/auth/login', data);
  return res.data;
};

// Export the configured axios instance for other services
export { apiClient };
