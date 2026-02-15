import api from './axiosInstance';

export const settingsApi = {
    // Get current user's settings
    getSettings: () => api.get('/api/settings'),

    // Get settings by user ID (admin)
    getSettingsByUser: (userId) => api.get(`/api/settings/user/${userId}`),

    // Update all settings
    updateSettings: (data) => api.put('/api/settings', data),

    // Update profile (firstName, lastName, email, timeZone)
    updateProfile: (data) => api.put('/api/settings/profile', data),

    // Update notification settings only
    updateNotifications: (data) => api.patch('/api/settings/notifications', data),

    // Update appearance settings only
    updateAppearance: (data) => api.patch('/api/settings/appearance', data),

    // Update privacy settings only
    updatePrivacy: (data) => api.patch('/api/settings/privacy', data),
};
