import api from './axiosInstance';

export const pauseRequestApi = {
  createRequest: (taskId, reason) => api.post('/api/pause-requests/request', { taskId, reason }),
  getPending: () => api.get('/api/pause-requests/pending'),
  getAll: () => api.get('/api/pause-requests/all'),
  approve: (id) => api.patch(`/api/pause-requests/${id}/approve`),
  reject: (id) => api.patch(`/api/pause-requests/${id}/reject`),
};
