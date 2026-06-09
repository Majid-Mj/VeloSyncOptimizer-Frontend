import apiClient from './apiClient';

export const purchaseOrderApi = {
  // Fetch all purchase orders
  getAll: async () => {
    const response = await apiClient.get('/purchaseorders');
    return response.data;
  },

  // Fetch purchase order details by ID (including line items)
  getById: async (id) => {
    const response = await apiClient.get(`/purchaseorders/${id}`);
    return response.data;
  },

  // Generate a new purchase order
  generate: async (data) => {
    const response = await apiClient.post('/purchaseorders/generate', data);
    return response.data;
  },

  // Approve a draft purchase order (restricted to ProcurementOfficer & Administrator roles)
  approve: async (id) => {
    const formData = new FormData();
    formData.append('Status', 'Approved');
    const response = await apiClient.patch(`/purchaseorders/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Cancel an active purchase order (restricted to ProcurementOfficer & Administrator roles)
  cancel: async (id) => {
    const formData = new FormData();
    formData.append('Status', 'Cancelled');
    const response = await apiClient.patch(`/purchaseorders/${id}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Receive stock from an approved purchase order (restricted to WarehouseManager role)
  receive: async (id, data) => {
    const response = await apiClient.put(`/purchaseorders/${id}/receive`, data);
    return response.data;
  }
};

export default purchaseOrderApi;
