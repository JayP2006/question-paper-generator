import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Syllabus
export const uploadSyllabus = (formData) => api.post('/upload-syllabus', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Previous Papers
export const uploadPreviousPapers = (formData) => api.post('/upload-previous-papers', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Generate Paper
export const generatePaper = (data) => api.post('/generate-paper', data);

// Download Paper
export const downloadPaper = (id) => api.get(`/download-paper/${id}`, { responseType: 'blob' });

// Questions
export const getQuestions = (params) => api.get('/questions', { params });

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// Analytics / Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getGeneratedPapers = () => api.get('/papers');
export const deletePaper = (id) => api.delete(`/papers/${id}`);
export const getPaperById = (id) => api.get(`/papers/${id}`);
export const updateProfile = (data) =>
  api.put('/auth/update-profile', data);
export default api;
