import axios from 'axios';

let rawUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').trim().replace(/\/$/, '');
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,  // ✅ 15 second timeout instead of default
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

// Handle token expiration - only redirect on 401 from protected session verification routes (like /auth/me)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Exclude login/register attempts from triggering page reload
      const isLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');
      if (url.includes('/auth/me') || (url.includes('/auth/') && !isLoginOrRegister)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
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

  generateResponse: async (messages) => {
    const response = await api.post('/chat/generate', { messages });
    return response.data;
  },
};

export default api;
