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
  getAll:   ()         => api.get('/eventos'),
  getById:  (id)       => api.get(`/eventos/${id}`),
  create:   (data)     => api.post('/eventos', data),
  update:   (id, data) => api.put(`/eventos/${id}`, data),
  remove:   (id)       => api.delete(`/eventos/${id}`),
  // Equipo
  getEquipo:          (id)              => api.get(`/eventos/${id}/equipo`),
  asignarColaborador: (id, data)        => api.post(`/eventos/${id}/equipo`, data),
  quitarColaborador:  (id, id_colab)    => api.delete(`/eventos/${id}/equipo/${id_colab}`),
  // Tareas del evento
  getTareas:    (id)       => api.get(`/eventos/${id}/tareas`),
  crearTarea:   (id, data) => api.post(`/eventos/${id}/tareas`, data),
};

export const tiposEventoApi = {
  getAll: () => api.get('/tipos-evento'),
};

export const colaboradoresApi = {
  getAll:    ()         => api.get('/colaboradores'),
  getById:   (id)       => api.get(`/colaboradores/${id}`),
  getTareas: (id)       => api.get(`/colaboradores/${id}/tareas`),
  create:    (data)     => api.post('/colaboradores', data),
  update:    (id, data) => api.put(`/colaboradores/${id}`, data),
  remove:    (id)       => api.delete(`/colaboradores/${id}`),
};

export const tareasApi = {
  getAll:  ()          => api.get('/tareas'),
  getById: (id)        => api.get(`/tareas/${id}`),
  create:  (data)      => api.post('/tareas', data),
  update:  (id, data)  => api.put(`/tareas/${id}`, data),
  remove:  (id)        => api.delete(`/tareas/${id}`),
};
