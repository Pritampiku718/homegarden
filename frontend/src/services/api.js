import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Sections
export const getSections = () => api.get('/sections');
export const getSection = (id) => api.get(`/sections/${id}`);
export const getSectionBySlug = (slug) => api.get(`/sections/slug/${slug}`);
export const createSection = (data) => api.post('/sections', data);
export const updateSection = (id, data) => api.put(`/sections/${id}`, data);
export const deleteSection = (id) => api.delete(`/sections/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const getCategoriesBySection = (sectionId) => api.get(`/categories/section/${sectionId}`);
export const getCategory = (id) => api.get(`/categories/${id}`);
export const getCategoryBySlug = (slug) => api.get(`/categories/slug/${slug}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Plants
export const getPlants = (params) => api.get('/plants', { params });
export const getPlant = (id) => api.get(`/plants/${id}`);
export const getPlantBySlug = (slug) => api.get(`/plants/slug/${slug}`);
export const getPlantsBySection = (sectionId, params) => api.get(`/plants/section/${sectionId}`, { params });
export const getPlantsByCategory = (categoryId, params) => api.get(`/plants/category/${categoryId}`, { params });
export const createPlant = (data) => api.post('/plants', data);
export const updatePlant = (id, data) => api.put(`/plants/${id}`, data);
export const deletePlant = (id) => api.delete(`/plants/${id}`);

export default api;