import apiClient from './apiClient';

export const supplierApi = {
  // Fetch all suppliers
  getAll: async () => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  // Fetch supplier by ID
  getById: async (id) => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  // Get all deliveries for a specific supplier
  getDeliveries: async (id) => {
    const response = await apiClient.get(`/suppliers/${id}/deliveries`);
    return response.data;
  },

  // Record supplier delivery
  recordDelivery: async (data) => {
    const response = await apiClient.post('/suppliers/deliveries', data);
    return response.data;
  }
};

export default supplierApi;
