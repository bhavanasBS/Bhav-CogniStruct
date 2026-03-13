import api from './axiosInstance';

export const attachmentApi = {
  upload: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByTask: (taskId) => api.get(`/api/tasks/${taskId}/attachments`),
  delete: (id) => api.delete(`/api/attachments/${id}`),
};
