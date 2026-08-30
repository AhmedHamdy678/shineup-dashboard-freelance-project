/**
 * Centralized Axios instance for the entire project.
 * - Reads the base URL from VITE_API_BASE_URL (defaults to /api/v1).
 * - Attaches the stored auth token on every request via an interceptor.
 * - On 401 responses, clears the stored session and redirects to /login.
 */
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 
    'Content-Type': 'application/json',
    'Accept-Language': 'ar'
  },
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
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    if (error.response?.status === 400 && error.response?.data) {
      const data = error.response.data;
      let detailedErrorString = '';

      if (data.errors) {
        const extracted = Object.values(data.errors).flat();
        if (extracted.length > 0) {
          detailedErrorString = extracted.join(' | ');
        }
      } else if (data.error) {
        detailedErrorString = typeof data.error === 'string' 
          ? data.error 
          : JSON.stringify(data.error);
      }

      if (detailedErrorString) {
        error.response.data.message = detailedErrorString;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
