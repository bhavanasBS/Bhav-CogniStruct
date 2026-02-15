import api from './axiosInstance';

export const workloadApi = {
  getByTeam: (teamId) => api.get(`/api/workload/team/${teamId}`),
  getByEmployee: (userId) => api.get(`/api/workload/employee/${userId}`),
  getRecommendation: (teamId, hours) => api.get(`/api/workload/recommend/${teamId}`, { params: { hours } }),
};
