import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { parseApiError } from '../utils/errorHandler';
import { clearAuthStorage } from '../context/AuthContext';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwrap response data & standardize error format
axiosClient.interceptors.response.use(
  (response) => {
    // Return direct data payload (Spring Boot returns DTOs directly)
    return response.data;
  },
  (error) => {
    const parsedError = parseApiError(error);

    // If token has expired or is invalid (401), trigger session expiry event
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    // Attach parsed error object to the rejected promise for easy access in components
    return Promise.reject(parsedError);
  }
);

export default axiosClient;
