import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Drug related APIs
export const createDrug = (drugData) => api.post('/drugs', drugData);
export const verifyDrug = (ndc) => api.get(`/drugs/${ndc}/verify`);
export const createBatch = (batchData) => api.post('/batches', batchData);
export const getInventory = () => api.get('/inventory');
export const addToInventory = (inventoryData) => api.post('/inventory', inventoryData);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);