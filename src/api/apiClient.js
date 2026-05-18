import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5009/api',
  withCredentials: true,
});

export default apiClient;
