import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjunta el token JWT en cada request (Fase 2+)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const eventosApi = {
  getAll:   ()        => api.get('/eventos'),
  getById:  (id)      => api.get(`/eventos/${id}`),
  create:   (data)    => api.post('/eventos', data),
  update:   (id, data)=> api.put(`/eventos/${id}`, data),
  remove:   (id)      => api.delete(`/eventos/${id}`),
};
