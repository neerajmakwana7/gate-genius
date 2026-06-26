import axios from 'axios';

const API_URL = 'https://gate-genius-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token automatically add karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Society APIs
export const societyAPI = {
  createSociety: (data) => api.post('/secretary/society/create', data),
  getSociety: (id) => api.get(`/secretary/society/${id}`),
  addResident: (data) => api.post('/secretary/resident/add', data),
  addWatchman: (data) => api.post('/secretary/watchman/add', data),
  addFlat: (data) => api.post('/secretary/flat/add', data),
  getAllFlats: (societyId) => api.get(`/secretary/flats/${societyId}`),
  getAllResidents: (societyId) => api.get(`/secretary/residents/${societyId}`),
  getAllWatchmen: (societyId) => api.get(`/secretary/watchmen/${societyId}`),
};

// Visitor APIs
export const visitorAPI = {
  registerVisitor: (formData) => api.post('/watchman/visitor/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPendingVisitors: () => api.get('/watchman/visitors/pending'),
  getAllVisitors: () => api.get('/watchman/visitors/all'),
  updateStatus: (id, status) => api.put(`/watchman/visitor/${id}/status`, { status }),
  getVisitorsByFlat: (flatId) => api.get(`/watchman/visitors/flat/${flatId}`),
};

export default api;