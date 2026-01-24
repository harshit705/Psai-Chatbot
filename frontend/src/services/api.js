import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL || process.env.VITE_APP_API_URL || 'http://localhost:5000/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetCode: async (email, resetCode) => {
    const response = await api.post('/auth/verify-reset-code', { email, resetCode });
    return response.data;
  },

  resetPassword: async (email, resetCode, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, resetCode, newPassword });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/auth/update-profile', profileData);
    return response.data;
  },
};

// Chat APIs
export const chatAPI = {
  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  getMessages: async (sessionName = 'default') => {
    const response = await api.get(`/chat/messages/${sessionName}`);
    return response.data;
  },

  saveMessages: async (sessionName, messages) => {
    const response = await api.post('/chat/messages', { sessionName, messages });
    return response.data;
  },

  createSession: async (sessionName) => {
    const response = await api.post('/chat/sessions', { sessionName });
    return response.data;
  },

  deleteSession: async (sessionName) => {
    const response = await api.delete(`/chat/sessions/${sessionName}`);
    return response.data;
  },

  clearChat: async (sessionName) => {
    const response = await api.delete(`/chat/messages/${sessionName}`);
    return response.data;
  },
};

export default api;
