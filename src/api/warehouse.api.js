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

  getById: async (id) => {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  update: async (id, warehouseData) => {
    const formData = new FormData();
    if (warehouseData.code !== undefined) formData.append('Code', warehouseData.code);
    if (warehouseData.name !== undefined) formData.append('Name', warehouseData.name);
    if (warehouseData.city !== undefined) formData.append('City', warehouseData.city || '');
    if (warehouseData.state !== undefined) formData.append('State', warehouseData.state || '');
    if (warehouseData.country !== undefined) formData.append('Country', warehouseData.country || '');
    if (warehouseData.totalCapacity !== undefined) formData.append('TotalCapacity', warehouseData.totalCapacity);
    if (warehouseData.managerId !== undefined) {
      if (warehouseData.managerId !== null && warehouseData.managerId !== '') {
        formData.append('ManagerId', warehouseData.managerId);
      }
    }
    if (warehouseData.isActive !== undefined) formData.append('IsActive', warehouseData.isActive);

    const response = await apiClient.patch(`/warehouses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  }
};

export default warehouseApi;
