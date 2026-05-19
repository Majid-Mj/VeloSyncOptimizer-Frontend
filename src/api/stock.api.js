import apiClient from './apiClient';

export const stockApi = {
  // Fetch all stock levels
  getAll: async () => {
    const response = await apiClient.get('/stock');
    return response.data;
  },

  // Fetch stock summary stats
  getSummary: async () => {
    const response = await apiClient.get('/stock/summary');
    return response.data;
  },


  // Fetch stock by warehouse
  getByWarehouse: async (warehouseId) => {
    const response = await apiClient.get(`/stock/warehouse/${warehouseId}`);
    return response.data;
  },

  // Fetch critical low-stock items
  getLowStock: async () => {
    const response = await apiClient.get('/stock/lowStock');
    return response.data;
  },

  // Adjust stock (restricted to WarehouseManager role)
  adjust: async (data) => {
    const response = await apiClient.post('/stock/stock/adjust', data);
    return response.data;
  },

  // Transfer stock between facilities (restricted to WarehouseManager & Administrator roles)
  transfer: async (data) => {
    const response = await apiClient.post('/stock/transfer', data);
    return response.data;
  },

  // Retrieve audit movements ledger
  getMovements: async ({ warehouseId, productId, pageNumber = 1, pageSize = 10 } = {}) => {
    const params = {};
    if (warehouseId) params.warehouseId = warehouseId;
    if (productId) params.productId = productId;
    params.pageNumber = pageNumber;
    params.pageSize = pageSize;

    const response = await apiClient.get('/stock/movements', { params });
    return response.data;
  }
};

export default stockApi;
