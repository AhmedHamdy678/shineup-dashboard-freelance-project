/**
 * Centralized Axios instance for the entire project.
 * - Reads the base URL from VITE_API_BASE_URL (defaults to /api/v1).
 * - Attaches the stored auth token on every request via an interceptor.
 * - On 401 responses, clears the stored session and redirects to /login.
 */
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
