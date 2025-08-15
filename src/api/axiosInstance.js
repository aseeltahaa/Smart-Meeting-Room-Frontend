import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7074/api', // ✅ matches backend
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ include credentials if your API uses cookies or Identity sessions
  withCredentials: false, // set to true only if backend sets cookies
});

// Optional: set token automatically if stored in localStorage
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
