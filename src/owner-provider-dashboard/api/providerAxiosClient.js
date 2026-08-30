
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
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('provider_token');
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

export default providerAxiosClient;
