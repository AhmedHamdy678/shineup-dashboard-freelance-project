
import axios from 'axios';
const providerAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

providerAxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('provider_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

providerAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('provider_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default providerAxiosClient;
