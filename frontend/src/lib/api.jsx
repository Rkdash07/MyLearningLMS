import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Request interceptor for common headers
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      // Optionally trigger a global sign-out or redirect
      console.warn('Unauthorized request');
    }
    
    if (error.response?.status === 431) {
      console.error('Request header fields too large');
    }
    
    return Promise.reject(error);
  }
);

export default api;


