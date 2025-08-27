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

// Handle 401 Unauthorized globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid → clear storage and redirect
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;
