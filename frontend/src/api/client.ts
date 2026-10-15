import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('workforce_token');
  const demoRole = localStorage.getItem('workforce_demo_role');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (demoRole) {
    config.headers['x-demo-role'] = demoRole;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data?.error || error.message || 'Network Error');
  }
);
