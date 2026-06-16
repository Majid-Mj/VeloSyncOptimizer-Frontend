import apiClient from './apiClient';

export const productApi = {
  getAll: async ({ pageNumber = 1, pageSize = 100 } = {}) => {
    const response = await apiClient.get('/Products', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/Products/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/Products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/Products/${id}`, data);
    return response.data;
  },

  updateReorder: async (id, data) => {
    const response = await apiClient.put(`/Products/${id}/reorder`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/Products/${id}`);
    return response.data;
  },

  getForecast: async (id, warehouseId, horizonDays = 14) => {
    const response = await apiClient.get(`/Products/${id}/forecast`, {
      params: { warehouseId, horizonDays }
    });
    return response.data;
  }
};

export default productApi;
