import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7074/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally - BUT exclude auth endpoints
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect if this is an auth-related request failure
      const isAuthRequest = error.config?.url?.includes('/Auth/');
      
      if (!isAuthRequest) {
        // Token expired or invalid on protected routes → clear storage and redirect
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;