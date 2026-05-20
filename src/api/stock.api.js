import apiClient from './apiClient';

export const stockApi = {
  // Fetch all stock levels
  getAll: async () => {
    const response = await apiClient.get('/stock');
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
    const response = await apiClient.post('/stock-transfers', data);
    return response.data;
  },

  // Get all transfers
  getTransfers: async ({ sourceWarehouseId, destWarehouseId, status } = {}) => {
    const params = {};
    if (sourceWarehouseId) params.sourceWarehouseId = sourceWarehouseId;
    if (destWarehouseId) params.destWarehouseId = destWarehouseId;
    if (status) params.status = status;
    const response = await apiClient.get('/stock-transfers', { params });
    return response.data;
  },

  // Dispatch stock out (step 1)
  dispatchTransfer: async (data) => {
    const response = await apiClient.post('/stock-transfers', data);
    return response.data;
  },

  // Accept stock shipment (step 2)
  acceptTransfer: async (id) => {
    const response = await apiClient.put(`/stock-transfers/${id}/accept`);
    return response.data;
  },

  // Retrieve audit movements ledger
  getMovements: async ({ warehouseId, productId, pageNumber = 1, pageSize = 10 } = {}) => {
    const params = {};
    if (warehouseId) params.warehouseId = warehouseId;
    if (productId) params.productId = productId;
    params.pageNumber = pageNumber;
    params.pageSize = pageSize;

    const response = await apiClient.get('/stock-transfers/movements', { params });
    return response.data;
  }
};

export default stockApi;
