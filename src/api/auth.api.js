import apiClient from './apiClient';

export const authApi = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  register: async (userData) => {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('confirmPassword', userData.confirmPassword);
    formData.append('role', userData.role);
    
    const response = await apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email, clientAppUrl) => {
    const response = await apiClient.post('/auth/forgot-password', { email, clientAppUrl });
    return response.data;
  },

  resetPassword: async (email, token, password, confirmPassword) => {
    const response = await apiClient.post('/auth/reset-password', { email, token, password, confirmPassword });
    return response.data;
  }
};
