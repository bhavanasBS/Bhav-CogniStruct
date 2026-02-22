import api from './axiosInstance';

export const dailyUpdateApi = {
    // Employee endpoints
    getToday: () => api.get('/api/daily-updates/today'),
    getMyHistory: () => api.get('/api/daily-updates/my-history'),
    submit: (data) => api.post('/api/daily-updates', data),
    getTeamLead: () => api.get('/api/daily-updates/team-lead'),
    getRecipients: () => api.get('/api/daily-updates/recipients'),

    // Team Lead endpoints
    getTeamUpdates: (params) => api.get('/api/daily-updates/team', { params }),
    acknowledgeUpdate: (id) => api.patch(`/api/daily-updates/${id}/acknowledge`),

    // Manager endpoints
    getConsistency: () => api.get('/api/daily-updates/consistency'),

    // HR endpoints
    getOrgSignals: () => api.get('/api/daily-updates/org-signals'),
};
