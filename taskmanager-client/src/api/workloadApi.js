import api from './axiosInstance';

export const workloadApi = {
  getAll: () => api.get('/api/workload/all'),
  getByTeam: (teamId) => api.get(`/api/workload/team/${teamId}`),
  getByEmployee: (userId) => api.get(`/api/workload/employee/${userId}`),
  getRecommendation: (teamId, hours) => api.get(`/api/workload/recommend/${teamId}`, { params: { hours } }),
  getSkillRecommendation: (teamId, requiredSkills, hours = 8) =>
    api.get(`/api/workload/recommend/${teamId}`, { params: { requiredSkills, hours } }),
};
