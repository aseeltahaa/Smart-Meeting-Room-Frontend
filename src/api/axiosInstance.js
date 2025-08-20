import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7074/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

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
