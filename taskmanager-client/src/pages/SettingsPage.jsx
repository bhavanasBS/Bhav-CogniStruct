import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Moon, Sun, Globe, Save, Sparkles, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { settingsApi } from '../api/settingsApi';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Admin', lastName: 'User', email: 'admin@cognistruct.com' };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        timeZone: 'Asia/Kolkata',
    });

    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            teamMessages: false,
        },
        appearance: {
            theme: 'light',
            compactMode: false,
        },
        privacy: {
            showOnlineStatus: true,
            showLastSeen: true,
        },
    });

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsApi.getSettings();
                const data = response.data;

                setSettings({
                    notifications: {
                        email: data.emailNotifications ?? true,
                        push: data.pushNotifications ?? true,
                        taskUpdates: data.taskUpdateNotifications ?? true,
                        teamMessages: data.teamMessageNotifications ?? false,
                    },
                    appearance: {
                        theme: data.theme || 'light',
                        compactMode: data.compactMode ?? false,
                    },
                    privacy: {
                        showOnlineStatus: data.showOnlineStatus ?? true,
                        showLastSeen: data.showLastSeen ?? true,
                    },
                });

                setProfile(prev => ({
                    ...prev,
                    timeZone: data.timeZone || 'Asia/Kolkata',
                }));
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                // Use default settings if fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Update profile from user context
    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                firstName: user.firstName || prev.firstName,
                lastName: user.lastName || prev.lastName,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

    const handleToggle = (category, key) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key],
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update profile
            await settingsApi.updateProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                timeZone: profile.timeZone,
            });

            // Update all settings
            await settingsApi.updateSettings({
                timeZone: profile.timeZone,
                emailNotifications: settings.notifications.email,
                pushNotifications: settings.notifications.push,
                taskUpdateNotifications: settings.notifications.taskUpdates,
                teamMessageNotifications: settings.notifications.teamMessages,
                theme: settings.appearance.theme,
                compactMode: settings.appearance.compactMode,
                showOnlineStatus: settings.privacy.showOnlineStatus,
                showLastSeen: settings.privacy.showLastSeen,
            });

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ checked, onChange }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Settings
                            <Sparkles className="w-5 h-5 text-amber-300" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Manage your preferences and account settings</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <Card className="col-span-2">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Profile Settings</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Zone</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select
                                    value={profile.timeZone}
                                    onChange={(e) => setProfile(prev => ({ ...prev, timeZone: e.target.value }))}
                                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Appearance */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Palette className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSettings(p => ({ ...p, appearance: { ...p.appearance, theme: 'light' } }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${settings.appearance.theme === 'light'
                                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Sun className="h-4 w-4" /> Light
                                </button>
                                <button
                                    onClick={() => setSettings(p => ({ ...p, appearance: { ...p.appearance, theme: 'dark' } }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${settings.appearance.theme === 'dark'
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Moon className="h-4 w-4" /> Dark
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Compact Mode</p>
                                <p className="text-xs text-slate-500">Reduce spacing for denser UI</p>
                            </div>
                            <Toggle
                                checked={settings.appearance.compactMode}
                                onChange={() => handleToggle('appearance', 'compactMode')}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Notifications & Privacy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                <Bell className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-1">
                        {[
                            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                            { key: 'taskUpdates', label: 'Task Updates', desc: 'When tasks are assigned or updated' },
                            { key: 'teamMessages', label: 'Team Messages', desc: 'Messages from team members' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <Toggle
                                    checked={settings.notifications[item.key]}
                                    onChange={() => handleToggle('notifications', item.key)}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Privacy */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Privacy</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-1">
                        {[
                            { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you\'re online' },
                            { key: 'showLastSeen', label: 'Show Last Seen', desc: 'Display your last active time' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <Toggle
                                    checked={settings.privacy[item.key]}
                                    onChange={() => handleToggle('privacy', item.key)}
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button icon={saving ? Loader2 : Save} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;
