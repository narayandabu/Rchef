import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Intercept request and conditionally attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // ✅ Don't attach token for login or signup
  const isAuthRoute = config.url.includes('/login') || config.url.includes('/signup');
  if (!isAuthRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
