import apiClient from './apiClient';

export const supplierApi = {
  // Fetch all suppliers
  getAll: async () => {
    const response = await apiClient.get('/Suppliers');
    return response.data;
  },

  // Fetch supplier by ID
  getById: async (id) => {
    const response = await apiClient.get(`/Suppliers/${id}`);
    return response.data;
  },

  // Get all deliveries for a specific supplier
  getDeliveries: async (id) => {
    const response = await apiClient.get(`/Suppliers/${id}/deliveries`);
    return response.data;
  },

  // Record supplier delivery
  recordDelivery: async (data) => {
    const response = await apiClient.post('/Suppliers/deliveries', data);
    return response.data;
  },

  // Create supplier
  create: async (data) => {
    const response = await apiClient.post('/Suppliers', data);
    return response.data;
  },

  // Update supplier
  update: async (id, data) => {
    const response = await apiClient.put(`/Suppliers/${id}`, data);
    return response.data;
  },

  // Delete supplier
  delete: async (id) => {
    const response = await apiClient.delete(`/Suppliers/${id}`);
    return response.data;
  }
};

export default supplierApi;
