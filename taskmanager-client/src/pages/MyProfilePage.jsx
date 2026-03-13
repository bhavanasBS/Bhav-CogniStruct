import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Calendar, Shield, Users, ClipboardList, Clock, TrendingUp,
    CheckCircle2, Timer, Briefcase, ChevronRight, Loader2, Building2, Crown,
    UserCheck, BarChart3, Settings, Phone, Globe, Hash, Edit3, ArrowRight,
    Camera, Heart, BookOpen, Save, X, Plus
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuthContext } from '../context/AuthContext';
import { getPrimaryRole, getRoleBadgeColor } from '../utils/roleUtils';
import { getInitials, generateAvatarColor } from '../utils/helpers';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════
   REUSABLE UI HELPERS
   ═══════════════════════════════════════════════════════════ */

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
        {Icon ? (
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
        ) : (
            <div className="w-8 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">{label}</p>
            <p className={`text-sm font-medium ${value && value !== '-Not Set-' ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {value || '-Not Set-'}
            </p>
        </div>
    </div>
);

const EditableDetailRow = ({ label, value, icon: Icon, isEditing, fieldKey, editData, onFieldChange, type = 'text', options }) => (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
        {Icon ? (
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
        ) : (
            <div className="w-8 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">{label}</p>
            {isEditing ? (
                type === 'select' ? (
                    <select
                        value={editData[fieldKey] || ''}
                        onChange={(e) => onFieldChange(fieldKey, e.target.value)}
                        className="w-full text-sm font-medium text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="">Select...</option>
                        {options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={editData[fieldKey] || ''}
                        onChange={(e) => onFieldChange(fieldKey, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="w-full text-sm font-medium text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                )
            ) : (
                <p className={`text-sm font-medium ${value && value !== '-Not Set-' ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {value || '-Not Set-'}
                </p>
            )}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, gradient, action }) => (
    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        {action}
    </div>
);

const EditButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
    >
        <Edit3 className="w-3 h-3" /> Edit
    </button>
);

const EditableTextArea = ({ value, isEditing, fieldKey, editData, onFieldChange, placeholder }) => (
    isEditing ? (
        <textarea
            value={editData[fieldKey] || ''}
            onChange={(e) => onFieldChange(fieldKey, e.target.value)}
            placeholder={placeholder || 'Write something...'}
            rows={4}
            className="w-full text-sm text-slate-700 leading-relaxed border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
    ) : (
        <p className={`text-sm leading-relaxed ${value ? 'text-slate-600' : 'text-slate-400 italic'}`}>
            {value || '-Not Set-'}
        </p>
    )
);

const SaveCancelButtons = ({ onSave, onCancel, saving }) => (
    <div className="flex items-center gap-2">
        <button
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
            <X className="w-3 h-3" /> Cancel
        </button>
        <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? 'Saving...' : 'Save'}
        </button>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const MyProfilePage = () => {
    const navigate = useNavigate();
    const authCtx = useAuthContext();
    const authUser = authCtx?.user || {};
    const fileInputRef = useRef(null);
    const currentRole = getPrimaryRole(authUser);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ABOUT');
    const [uploading, setUploading] = useState(false);
    const [editingSection, setEditingSection] = useState(null); // 'primary' | 'contact' | null
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    /* ── Skills helpers ── */
    const skills = (profile?.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const addSkill = async () => {
        const trimmed = skillInput.trim();
        if (!trimmed || skills.includes(trimmed)) { setSkillInput(''); return; }
        const updated = [...skills, trimmed].join(',');
        try {
            await userApi.updateProfile({ skills: updated });
            setProfile(prev => ({ ...prev, skills: updated }));
            setSkillInput('');
            toast.success('Skill added');
        } catch (err) { console.error('Add skill failed:', err); toast.error('Failed to add skill'); }
    };

    const removeSkill = async (skill) => {
        const updated = skills.filter(s => s !== skill).join(',') || null;
        try {
            await userApi.updateProfile({ skills: updated || '' });
            setProfile(prev => ({ ...prev, skills: updated }));
            toast.success('Skill removed');
        } catch (err) { console.error('Remove skill failed:', err); toast.error('Failed to remove skill'); }
    };

    /* ── Edit helpers ── */
    const defaultBio = (role) => {
        if (role === 'Admin') return 'System administrator at CogniStruct managing platform operations, user access, and organizational oversight.';
        if (role === 'Manager') return 'Project manager overseeing team operations and driving productivity.';
        if (role === 'TeamLead' || role === 'Team Lead') return 'Team lead guiding a talented group of professionals towards project goals.';
        return 'Dedicated professional contributing to team objectives through consistent task execution and collaboration.';
    };

    const startEditing = (section) => {
        setEditingSection(section);
        if (section === 'primary') {
            setEditData({
                firstName: profile?.firstName || '',
                middleName: profile?.middleName || '',
                lastName: profile?.lastName || '',
                displayName: profile?.displayName || `${profile?.firstName} ${profile?.lastName}`,
                gender: profile?.gender || '',
                dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
                nationality: profile?.nationality || '',
            });
        } else if (section === 'contact') {
            setEditData({
                personalEmail: profile?.personalEmail || '',
                mobileNumber: profile?.mobileNumber || '',
                workNumber: profile?.workNumber || '',
            });
        } else if (section === 'about') {
            setEditData({ bio: profile?.bio || defaultBio(primaryRole) });
        } else if (section === 'jobLove') {
            setEditData({ jobLove: profile?.jobLove || '' });
        } else if (section === 'interests') {
            setEditData({ interests: profile?.interests || '' });
        } else if (section === 'employment') {
            setEditData({
                jobTitle: profile?.jobTitle || '',
                inProbation: profile?.inProbation || '',
                noticePeriod: profile?.noticePeriod || '',
                workerType: profile?.workerType || '',
                timeType: profile?.timeType || '',
            });
        }
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setEditData({});
    };

    const handleFieldChange = (key, value) => {
        setEditData((prev) => ({ ...prev, [key]: value }));
    };

    const saveProfileChanges = async () => {
        setSaving(true);
        try {
            // Sanitize: convert empty strings to null so ASP.NET can deserialize
            const payload = {};
            for (const [key, value] of Object.entries(editData)) {
                if (key === 'dateOfBirth') {
                    payload[key] = value ? value : null;
                } else {
                    payload[key] = value === '' ? null : value;
                }
            }
            await userApi.updateProfile(payload);
            // Refresh profile
            const { data } = await userApi.getProfileByRole(currentRole);
            setProfile(data);
            setEditingSection(null);
            setEditData({});
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error('Save failed:', err);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await userApi.getProfileByRole(currentRole);
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, [currentRole]);

    /* ── Avatar upload handler ── */
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Image must be under 5 MB');
            return;
        }

        setUploading(true);
        try {
            const { data } = await userApi.uploadAvatar(file);
            setProfile((prev) => ({ ...prev, profileImageUrl: data.profileImageUrl }));
            toast.success('Profile image updated!');
        } catch (err) {
            console.error('Avatar upload failed:', err);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    /* ── Loading / Error ── */
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-sm text-slate-500">Loading your profile…</p>
                </div>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-sm text-slate-500">Could not load your profile.</p>
            </div>
        );
    }

    /* ── Derived values ── */
    const primaryRole = getPrimaryRole(profile.roles?.length ? { roles: profile.roles } : authUser);
    const avatarColor = generateAvatarColor(profile.firstName || '');
    const completionRate = profile.totalTasks > 0
        ? Math.round((profile.completedTasks / profile.totalTasks) * 100)
        : 0;
    const employeeNumber = `CS${String(profile.id).padStart(6, '0')}`;
    const dateOfJoining = new Date(profile.createdDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    const fullName = `${profile.firstName} ${profile.lastName}`;

    const roleTitles = { Admin: 'System Administrator', Manager: 'Project Manager', TeamLead: 'Team Lead', 'Team Lead': 'Team Lead', Employee: 'Software Engineer' };
    const jobTitle = roleTitles[primaryRole] || 'Employee';

    const roleGradients = {
        Admin: 'from-purple-600 via-indigo-600 to-blue-600',
        Manager: 'from-blue-600 via-cyan-600 to-teal-500',
        TeamLead: 'from-cyan-600 via-teal-600 to-emerald-500',
        'Team Lead': 'from-cyan-600 via-teal-600 to-emerald-500',
        Employee: 'from-indigo-600 via-purple-600 to-pink-500',
    };
    const roleIcons = { Admin: Crown, Manager: Briefcase, TeamLead: Users, 'Team Lead': Users, Employee: User };
    const headerGradient = roleGradients[primaryRole] || roleGradients.Employee;
    const RoleIcon = roleIcons[primaryRole] || User;

    /* ── Tabs ── */
    const tabs = ['ABOUT', 'PROFILE', 'JOB'];

    return (
        <div className="space-y-0 max-w-5xl mx-auto">

            {/* ═══════════ HERO BANNER (persistent) ═══════════ */}
            <div className={`bg-gradient-to-r ${headerGradient} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar with camera overlay */}
                    <div className="relative group">
                        {profile.profileImageUrl && !profile._avatarError ? (
                            <img
                                src={profile.profileImageUrl}
                                alt={fullName}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl ring-4 ring-white/20"
                                onError={(e) => { e.target.style.display = 'none'; setProfile(prev => ({ ...prev, _avatarError: true })); }}
                            />
                        ) : (
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${avatarColor} text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-xl ring-4 ring-white/20`}>
                                {getInitials(profile)}
                            </div>
                        )}
                        {/* Camera overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer"
                        >
                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                        {uploading && (
                            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-white shadow-sm" />
                    </div>

                    {/* Name & badges */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{fullName}</h1>
                        <p className="text-white/70 text-sm mt-0.5">{jobTitle}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
                                <RoleIcon className="w-3.5 h-3.5" /> {primaryRole}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/10">
                                <Hash className="w-3 h-3" /> {employeeNumber}
                            </span>
                            {profile.isActive && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs border border-emerald-400/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                                </span>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══════════ TAB BAR ═══════════ */}
            <div className="bg-white border-x border-b border-slate-200 rounded-b-none">
                <div className="flex px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3.5 text-sm font-semibold tracking-wide transition-colors relative cursor-pointer
                ${activeTab === tab
                                    ? 'text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════ TAB CONTENT ═══════════ */}
            <div className="mt-6 space-y-6">

                {/* ──────── ABOUT TAB ──────── */}
                {activeTab === 'ABOUT' && (
                    <>
                        {/* Summary */}
                        <Card>
                            <SectionHeader
                                icon={BookOpen}
                                title="About"
                                gradient="from-indigo-500 to-indigo-600"
                                action={editingSection === 'about'
                                    ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                    : <EditButton onClick={() => startEditing('about')} />
                                }
                            />
                            <div className="px-6 py-5">
                                <EditableTextArea
                                    value={profile.bio || defaultBio(primaryRole)}
                                    isEditing={editingSection === 'about'}
                                    fieldKey="bio"
                                    editData={editData}
                                    onFieldChange={handleFieldChange}
                                    placeholder="Write about yourself..."
                                />
                            </div>
                        </Card>

                        {/* What I love about my job */}
                        <Card>
                            <SectionHeader
                                icon={Heart}
                                title="What I love about my job?"
                                gradient="from-rose-500 to-pink-600"
                                action={editingSection === 'jobLove'
                                    ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                    : <EditButton onClick={() => startEditing('jobLove')} />
                                }
                            />
                            <div className="px-6 py-5">
                                <EditableTextArea
                                    value={profile.jobLove}
                                    isEditing={editingSection === 'jobLove'}
                                    fieldKey="jobLove"
                                    editData={editData}
                                    onFieldChange={handleFieldChange}
                                    placeholder="What do you love about your job?"
                                />
                            </div>
                        </Card>

                        {/* Interests & hobbies */}
                        <Card>
                            <SectionHeader
                                title="My interests and hobbies"
                                gradient="from-amber-500 to-orange-600"
                                action={editingSection === 'interests'
                                    ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                    : <EditButton onClick={() => startEditing('interests')} />
                                }
                            />
                            <div className="px-6 py-5">
                                <EditableTextArea
                                    value={profile.interests}
                                    isEditing={editingSection === 'interests'}
                                    fieldKey="interests"
                                    editData={editData}
                                    onFieldChange={handleFieldChange}
                                    placeholder="Share your interests and hobbies..."
                                />
                            </div>
                        </Card>

                        {/* Role-specific stats overview (Admin, Manager, TeamLead only) */}
                        {primaryRole !== 'Employee' && (
                            <Card>
                                <SectionHeader
                                    icon={BarChart3}
                                    title={primaryRole === 'Admin' ? 'System Overview'
                                        : 'Team Performance'}
                                    gradient="from-emerald-500 to-emerald-600"
                                />
                                <div className="p-6">
                                    {/* ── ADMIN stats ── */}
                                    {primaryRole === 'Admin' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                            {[
                                                { label: 'Total Users', value: profile.allUsersCount, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                                                { label: 'Active Users', value: profile.activeUsersCount, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600' },
                                                { label: 'Inactive', value: profile.inactiveUsersCount, icon: User, color: 'bg-red-50 text-red-600' },
                                                { label: 'Teams', value: profile.allTeamsCount, icon: Building2, color: 'bg-blue-50 text-blue-600' },
                                                { label: 'All Tasks', value: profile.allTasksCount, icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
                                                { label: 'Completed', value: profile.totalCompletedTasksOrg, icon: CheckCircle2, color: 'bg-teal-50 text-teal-600' },
                                            ].map((s) => (
                                                <div key={s.label} className="text-center rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                                                    <div className={`w-9 h-9 rounded-lg ${s.color.split(' ')[0]} flex items-center justify-center mx-auto mb-2`}>
                                                        <s.icon className={`w-4 h-4 ${s.color.split(' ')[1]}`} />
                                                    </div>
                                                    <p className="text-xl font-bold text-slate-900">{s.value ?? 0}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── MANAGER / TEAMLEAD stats ── */}
                                    {(primaryRole === 'Manager' || primaryRole === 'TeamLead' || primaryRole === 'Team Lead') && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                            {[
                                                { label: 'Team Members', value: profile.teamMembersCount, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                                                { label: 'Team Tasks', value: profile.teamTasksCount, icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
                                                { label: 'Completed', value: profile.teamCompletedTasks, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                                                { label: 'Completion %', value: `${profile.teamCompletionRate ?? 0}%`, icon: TrendingUp, color: 'bg-teal-50 text-teal-600' },
                                                { label: 'Overdue', value: profile.teamOverdueTasks, icon: Timer, color: 'bg-red-50 text-red-600' },
                                                { label: 'Team Hours', value: profile.teamHoursLogged, icon: Clock, color: 'bg-purple-50 text-purple-600' },
                                            ].map((s) => (
                                                <div key={s.label} className="text-center rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                                                    <div className={`w-9 h-9 rounded-lg ${s.color.split(' ')[0]} flex items-center justify-center mx-auto mb-2`}>
                                                        <s.icon className={`w-4 h-4 ${s.color.split(' ')[1]}`} />
                                                    </div>
                                                    <p className="text-xl font-bold text-slate-900">{s.value ?? 0}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Completion bar (common for non-Employee) */}
                                    {profile.totalTasks > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-slate-700">Personal Task Completion</p>
                                                <p className="text-sm font-bold text-indigo-600">{completionRate}%</p>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mt-5 p-3 rounded-xl bg-purple-50 border border-purple-100">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-purple-800">{profile.totalHoursLogged?.toFixed(1) || '0.0'} hours</p>
                                            <p className="text-[11px] text-purple-500">Total Hours Logged</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* ── EMPLOYEE: Skills Card ── */}
                        {primaryRole === 'Employee' && (
                            <Card>
                                <SectionHeader
                                    title="My Skills"
                                    gradient="from-violet-500 to-purple-600"
                                />
                                <div className="p-6">
                                    {/* Skill chips */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {skills.length > 0 ? skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 hover:border-violet-300 transition-colors group"
                                            >
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill(skill)}
                                                    className="w-4 h-4 rounded-full flex items-center justify-center text-violet-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
                                                    title="Remove skill"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        )) : (
                                            <p className="text-sm text-slate-400 italic">No skills added yet. Start adding your skills below!</p>
                                        )}
                                    </div>

                                    {/* Add skill input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                            placeholder="Type a skill and press Enter..."
                                            className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        />
                                        <button
                                            onClick={addSkill}
                                            disabled={!skillInput.trim()}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>

                                    {skills.length > 0 && (
                                        <p className="text-[11px] text-slate-400 mt-3">{skills.length} skill{skills.length !== 1 ? 's' : ''} added</p>
                                    )}
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* ──────── PROFILE TAB ──────── */}
                {activeTab === 'PROFILE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Primary Details */}
                        <Card>
                            <SectionHeader
                                icon={User}
                                title="Primary Details"
                                gradient="from-indigo-500 to-indigo-600"
                                action={editingSection === 'primary'
                                    ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                    : <EditButton onClick={() => startEditing('primary')} />
                                }
                            />
                            <div className="px-6 py-2">
                                <EditableDetailRow icon={User} label="First Name" value={profile.firstName} isEditing={editingSection === 'primary'} fieldKey="firstName" editData={editData} onFieldChange={handleFieldChange} />
                                <EditableDetailRow icon={null} label="Middle Name" value={profile.middleName} isEditing={editingSection === 'primary'} fieldKey="middleName" editData={editData} onFieldChange={handleFieldChange} />
                                <EditableDetailRow icon={User} label="Last Name" value={profile.lastName} isEditing={editingSection === 'primary'} fieldKey="lastName" editData={editData} onFieldChange={handleFieldChange} />
                                <EditableDetailRow icon={null} label="Display Name" value={profile.displayName || fullName} isEditing={editingSection === 'primary'} fieldKey="displayName" editData={editData} onFieldChange={handleFieldChange} />
                                <EditableDetailRow icon={null} label="Gender" value={profile.gender} isEditing={editingSection === 'primary'} fieldKey="gender" editData={editData} onFieldChange={handleFieldChange} type="select" options={['Male', 'Female', 'Other', 'Prefer not to say']} />
                                <EditableDetailRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null} isEditing={editingSection === 'primary'} fieldKey="dateOfBirth" editData={editData} onFieldChange={handleFieldChange} type="date" />
                                <EditableDetailRow icon={Globe} label="Nationality" value={profile.nationality} isEditing={editingSection === 'primary'} fieldKey="nationality" editData={editData} onFieldChange={handleFieldChange} />
                            </div>
                        </Card>

                        {/* Contact Details */}
                        <Card>
                            <SectionHeader
                                icon={Mail}
                                title="Contact Details"
                                gradient="from-emerald-500 to-emerald-600"
                                action={editingSection === 'contact'
                                    ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                    : <EditButton onClick={() => startEditing('contact')} />
                                }
                            />
                            <div className="px-6 py-2">
                                <DetailRow icon={Mail} label="Work Email" value={profile.email} />
                                <EditableDetailRow icon={Mail} label="Personal Email" value={profile.personalEmail} isEditing={editingSection === 'contact'} fieldKey="personalEmail" editData={editData} onFieldChange={handleFieldChange} type="email" />
                                <EditableDetailRow icon={Phone} label="Mobile Number" value={profile.mobileNumber} isEditing={editingSection === 'contact'} fieldKey="mobileNumber" editData={editData} onFieldChange={handleFieldChange} type="tel" />
                                <EditableDetailRow icon={Phone} label="Work Number" value={profile.workNumber} isEditing={editingSection === 'contact'} fieldKey="workNumber" editData={editData} onFieldChange={handleFieldChange} type="tel" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* ──────── JOB TAB ──────── */}
                {activeTab === 'JOB' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Employment Details */}
                            <Card>
                                <SectionHeader
                                    icon={Briefcase}
                                    title="Employment Details"
                                    gradient="from-purple-500 to-purple-600"
                                    action={editingSection === 'employment'
                                        ? <SaveCancelButtons onSave={saveProfileChanges} onCancel={cancelEditing} saving={saving} />
                                        : <EditButton onClick={() => startEditing('employment')} />
                                    }
                                />
                                <div className="px-6 py-2">
                                    <DetailRow icon={Hash} label="Employee Number" value={employeeNumber} />
                                    <DetailRow icon={Calendar} label="Date of Joining" value={dateOfJoining} />
                                    <EditableDetailRow icon={Briefcase} label="Job Title — Primary" value={profile.jobTitle || jobTitle} isEditing={editingSection === 'employment'} fieldKey="jobTitle" editData={editData} onFieldChange={handleFieldChange} />
                                    <DetailRow icon={Shield} label="Department" value={profile.teams?.length > 0 ? profile.teams[0].teamName : null} />
                                    <EditableDetailRow icon={null} label="In Probation?" value={profile.inProbation} isEditing={editingSection === 'employment'} fieldKey="inProbation" editData={editData} onFieldChange={handleFieldChange} />
                                    <EditableDetailRow icon={null} label="Notice Period" value={profile.noticePeriod} isEditing={editingSection === 'employment'} fieldKey="noticePeriod" editData={editData} onFieldChange={handleFieldChange} />
                                    <EditableDetailRow icon={null} label="Worker Type" value={profile.workerType || 'Permanent'} isEditing={editingSection === 'employment'} fieldKey="workerType" editData={editData} onFieldChange={handleFieldChange} type="select" options={['Permanent', 'Contract', 'Intern', 'Freelance', 'Part-Time']} />
                                    <EditableDetailRow icon={null} label="Time Type" value={profile.timeType || 'Full Time'} isEditing={editingSection === 'employment'} fieldKey="timeType" editData={editData} onFieldChange={handleFieldChange} type="select" options={['Full Time', 'Part Time', 'Flexible']} />
                                </div>
                            </Card>

                            {/* Reporting & Teams — read-only system data */}
                            <Card>
                                <SectionHeader icon={Building2} title="Reporting & Teams" gradient="from-cyan-500 to-blue-600" />
                                <div className="px-6 py-2">
                                    {/* Reporting Manager — clickable to view public profile */}
                                    {profile.managerId && profile.managerName ? (
                                        <div className="flex items-start gap-3 py-3 border-b border-slate-100">
                                            <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Reporting Manager</p>
                                                <button
                                                    onClick={() => navigate(`/view-profile/${profile.managerId}`)}
                                                    className="text-sm mt-0.5 text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer transition-colors"
                                                >
                                                    {profile.managerName} →
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <DetailRow icon={UserCheck} label="Reporting Manager" value={profile.managerName} />
                                    )}
                                    <DetailRow icon={Users} label="Direct Reports" value={profile.directReportsCount > 0 ? `${profile.directReportsCount} members` : null} />
                                    <DetailRow icon={Building2} label="Teams Managed" value={profile.managedTeamsCount > 0 ? `${profile.managedTeamsCount} teams` : null} />

                                    {profile.teams?.length > 0 && (
                                        <div className="pt-3 mt-1 border-t border-slate-100">
                                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Team Memberships</p>
                                            <div className="space-y-2">
                                                {profile.teams.map((team) => (
                                                    <button
                                                        key={team.teamId}
                                                        onClick={() => navigate(`/teams/${team.teamId}`)}
                                                        className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                                                            <Users className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <div className="text-left flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-800 truncate">{team.teamName}</p>
                                                            <p className="text-[10px] text-slate-500">{team.role}</p>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Leadership Overview — Manager / Admin / TeamLead */}
                        {(primaryRole === 'Manager' || primaryRole === 'Admin' || primaryRole === 'TeamLead' || primaryRole === 'Team Lead') && (profile.directReportsCount > 0 || profile.managedTeamsCount > 0) && (
                            <Card>
                                <SectionHeader icon={Crown} title="Leadership Overview" gradient="from-violet-500 to-purple-600" />
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                                            <Users className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-slate-900">{profile.teamMembersCount ?? profile.directReportsCount}</p>
                                            <p className="text-xs text-slate-500 font-medium">Team Members</p>
                                        </div>
                                        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                            <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-slate-900">{profile.managedTeamsCount}</p>
                                            <p className="text-xs text-slate-500 font-medium">Teams Managed</p>
                                        </div>
                                        <div className="text-center p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                            <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-slate-900">{profile.teamCompletionRate ?? completionRate}%</p>
                                            <p className="text-xs text-slate-500 font-medium">Team Completion</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default MyProfilePage;
