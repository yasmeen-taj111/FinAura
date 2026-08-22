import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  // Never leave a login/register screen spinning forever when the API or database is offline.
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The server is taking too long to respond. Please try again.';
    }
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
