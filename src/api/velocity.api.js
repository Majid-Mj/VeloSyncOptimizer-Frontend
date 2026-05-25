import apiClient from './apiClient';

export const velocityApi = {
  // GET: api/velocity?productId=1&warehouseId=1&topMovers=false&limit=12
  getVelocity: async ({ productId = null, warehouseId = null, topMovers = false, limit = 12 } = {}) => {
    const params = {};
    if (productId) params.productId = productId;
    if (warehouseId) params.warehouseId = warehouseId;
    params.topMovers = topMovers;
    params.limit = limit;

    const response = await apiClient.get('/velocity', { params });
    return response.data; // returns ApiResponse<List<VelocityResultDto>>
  }
};

export default velocityApi;
