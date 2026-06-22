import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5009/api',
  withCredentials: true,
});

// Request interceptor to attach Bearer Token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('velosync_auth');
      if (stored) {
        const authData = JSON.parse(stored);
        if (authData && authData.accessToken) {
          config.headers.Authorization = `Bearer ${authData.accessToken}`;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth token for request authorization:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if the unauthorized request is the login attempt itself
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      console.warn('Unauthorized request detected (401). Clearing session and logging out.');
      try {
        localStorage.removeItem('velosync_auth');
      } catch (e) {
        console.error('Failed to clear auth state from localStorage:', e);
      }
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
