import api from './axiosInstance';

export const taskApi = {
  getAll: (params) => api.get('/api/tasks', { params }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),
  getByEmployee: (employeeId, params) => api.get(`/api/tasks/employee/${employeeId}`, { params }),
  getByManager: (managerId, params) => api.get(`/api/tasks/manager/${managerId}`, { params }),
  getByTeam: (teamId, params) => api.get(`/api/tasks/team/${teamId}`, { params }),
  getSubTasks: (parentId) => api.get(`/api/tasks/${parentId}/subtasks`),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};
