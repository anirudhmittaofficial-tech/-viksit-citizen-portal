import axios from 'axios';

let rawBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://viksit-citizen.onrender.com/api' : 'http://localhost:5000/api');
if (rawBase.endsWith('/')) rawBase = rawBase.slice(0, -1);
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Interceptor to attach Authorization header if token exists
apiClient.interceptors.request.use(
  (config) => {
    try {
      const savedSession = localStorage.getItem('civic_session');
      if (savedSession) {
        const { token } = JSON.parse(savedSession);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Error reading token from localStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
