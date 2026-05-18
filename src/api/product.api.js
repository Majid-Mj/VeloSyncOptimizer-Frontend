import apiClient from './apiClient';

export const productApi = {
  getAll: async ({ pageNumber = 1, pageSize = 100 } = {}) => {
    const response = await apiClient.get('/products', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }
};

export default productApi;
