import axios from 'axios';
import { MenuItem, Order, AuthResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Menu API
export const menuAPI = {
  getAll: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu');
    return response.data;
  },
  
  getByCategory: async (category: string): Promise<MenuItem[]> => {
    const response = await api.get(`/menu/category/${category}`);
    return response.data;
  },
  
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/menu/categories/list');
    return response.data;
  },
  
  create: async (menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.post('/menu', menuItem);
    return response.data;
  },
  
  update: async (id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.put(`/menu/${id}`, menuItem);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/menu/${id}`);
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: { tableId: string; items: any[]; totalAmount: number }): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getAll: async (status?: string): Promise<Order[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  getByTable: async (tableId: string): Promise<Order[]> => {
    const response = await api.get(`/orders/table/${tableId}`);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username: string, password: string, role: string): Promise<void> => {
    await api.post('/auth/register', { username, password, role });
  },
};

// Table API
export const tableAPI = {
  getAll: async () => {
    const response = await api.get('/tables');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },
  
  create: async (tableData: { tableNumber: number; capacity: number }) => {
    const response = await api.post('/tables', tableData);
    return response.data;
  },
  
  update: async (id: string, tableData: Partial<{ tableNumber: number; capacity: number; isAvailable: boolean }>) => {
    const response = await api.put(`/tables/${id}`, tableData);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/tables/${id}`);
  },
  
  generateQR: async (tableId: string) => {
    const response = await api.post(`/qr/generate/${tableId}`);
    return response.data;
  },
  
  regenerateAllQR: async () => {
    const response = await api.post('/qr/regenerate-all');
    return response.data;
  },
};

export default api;