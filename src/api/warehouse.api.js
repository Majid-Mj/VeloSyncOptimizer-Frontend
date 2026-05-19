import apiClient from './apiClient';

export const warehouseApi = {
  getAll: async () => {
    const response = await apiClient.get('/warehouses');
    return response.data;
  },

  create: async (warehouseData) => {
    // Sends standard JSON to match [FromBody] CreateWarehouseCommand on the controller
    const response = await apiClient.post('/warehouses', warehouseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  }
};

export default warehouseApi;
