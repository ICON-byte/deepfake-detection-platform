import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your running Node.js backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Intercepts requests to append the active user JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);