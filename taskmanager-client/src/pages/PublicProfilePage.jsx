import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Mail, Calendar, Shield, Users, Briefcase, ChevronRight, Loader2,
    Building2, Clock, Globe, BookOpen, Heart, Sparkles, ArrowLeft, ChevronLeft, Phone
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { getRoleBadgeColor } from '../utils/roleUtils';
import { getInitials, generateAvatarColor } from '../utils/helpers';
import Card from '../components/common/Card';

/* ─── Tiny helpers (same style as MyProfilePage) ─── */
const SectionHeader = ({ icon: Icon, title, gradient }) => (
    <div className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${gradient} rounded-t-xl`}>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
    </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
        {!Icon && <div className="w-4" />}
        <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
            <p className={`text-sm mt-0.5 ${value ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                {value || '-Not Set-'}
            </p>
        </div>
    </div>
);

/* ─── Role gradients ─── */
const roleGradients = {
    Admin: 'from-slate-800 to-slate-900',
    Manager: 'from-blue-600 to-indigo-700',
    HR: 'from-teal-600 to-emerald-700',
    TeamLead: 'from-violet-600 to-purple-700',
    'Team Lead': 'from-violet-600 to-purple-700',
    Employee: 'from-indigo-600 to-purple-700',
};

const PublicProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await userApi.getPublicProfile(userId);
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch public profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <User className="w-16 h-16 text-slate-300" />
                <p className="text-slate-500 text-lg">User not found</p>
                <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer">
                    ← Go back
                </button>
            </div>
        );
    }

    const fullName = `${profile.firstName} ${profile.lastName}`;
    const primaryRole = profile.roles?.[0] || 'Employee';
    const headerGradient = roleGradients[primaryRole] || roleGradients.Employee;
    const avatarColor = generateAvatarColor(fullName);
    const skills = (profile.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const roleBadge = getRoleBadgeColor(primaryRole);
    const dateOfJoining = profile.createdDate
        ? new Date(profile.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;
    const dateOfBirth = profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : null;

    const defaultBio = (role) => {
        if (role === 'Admin') return 'System administrator managing platform operations and organizational oversight.';
        if (role === 'Manager') return 'Project manager overseeing team operations and driving productivity.';
        if (role === 'HR') return 'HR professional responsible for employee management and workforce analytics.';
        if (role === 'TeamLead' || role === 'Team Lead') return 'Team lead guiding professionals towards project goals.';
        return 'Dedicated professional contributing to team objectives through consistent task execution.';
    };

    return (
        <div className="space-y-0 max-w-5xl mx-auto">

            {/* ═══════════ BACK BUTTON ═══════════ */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" /> Back to my profile
            </button>

            {/* ═══════════ HERO BANNER ═══════════ */}
            <div className={`bg-gradient-to-r ${headerGradient} rounded-t-2xl p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="relative">
                        {profile.profileImageUrl && !profile._avatarError ? (
                            <img
                                src={profile.profileImageUrl}
                                alt={fullName}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl ring-4 ring-white/20"
                                onError={() => setProfile(prev => ({ ...prev, _avatarError: true }))}
                            />
                        ) : (
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${avatarColor} text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-xl ring-4 ring-white/20`}>
                                {getInitials(profile)}
                            </div>
                        )}
                    </div>

                    {/* Name + role */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.displayName || fullName}</h1>
                        <p className="text-white/70 text-sm mt-1">{profile.jobTitle || primaryRole}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleBadge}`}>
                                <Shield className="w-3 h-3" /> {primaryRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════ CONTENT CARDS ═══════════ */}
            <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 border-t-0 p-6 space-y-6">

                {/* About */}
                <Card>
                    <SectionHeader icon={BookOpen} title="About" gradient="from-indigo-500 to-indigo-600" />
                    <div className="px-6 py-5">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {profile.bio || defaultBio(primaryRole)}
                        </p>
                    </div>
                </Card>

                {/* What I love about my job */}
                {profile.jobLove && (
                    <Card>
                        <SectionHeader icon={Heart} title="What I love about my job?" gradient="from-rose-500 to-pink-600" />
                        <div className="px-6 py-5">
                            <p className="text-sm text-slate-600 leading-relaxed">{profile.jobLove}</p>
                        </div>
                    </Card>
                )}

                {/* Interests */}
                {profile.interests && (
                    <Card>
                        <SectionHeader icon={Sparkles} title="Interests & Hobbies" gradient="from-amber-500 to-orange-600" />
                        <div className="px-6 py-5">
                            <p className="text-sm text-slate-600 leading-relaxed">{profile.interests}</p>
                        </div>
                    </Card>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <Card>
                        <SectionHeader icon={Sparkles} title="Skills" gradient="from-violet-500 to-purple-600" />
                        <div className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Primary Details & Contact Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <SectionHeader icon={User} title="Primary Details" gradient="from-indigo-500 to-indigo-600" />
                        <div className="px-6 py-2">
                            <DetailRow icon={User} label="First Name" value={profile.firstName} />
                            <DetailRow icon={User} label="Last Name" value={profile.lastName} />
                            <DetailRow icon={null} label="Display Name" value={profile.displayName || fullName} />
                            <DetailRow icon={null} label="Gender" value={profile.gender} />
                            <DetailRow icon={Calendar} label="Date of Birth" value={dateOfBirth} />
                            <DetailRow icon={Globe} label="Nationality" value={profile.nationality} />
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader icon={Mail} title="Contact Details" gradient="from-emerald-500 to-emerald-600" />
                        <div className="px-6 py-2">
                            <DetailRow icon={Mail} label="Work Email" value={profile.email} />
                            <DetailRow icon={Mail} label="Personal Email" value={profile.personalEmail} />
                            <DetailRow icon={Phone} label="Mobile Number" value={profile.mobileNumber} />
                            <DetailRow icon={Phone} label="Work Number" value={profile.workNumber} />
                        </div>
                    </Card>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <SectionHeader icon={Briefcase} title="Job Details" gradient="from-purple-500 to-purple-600" />
                        <div className="px-6 py-2">
                            <DetailRow icon={Briefcase} label="Job Title" value={profile.jobTitle} />
                            <DetailRow icon={Calendar} label="Date of Joining" value={dateOfJoining} />
                            <DetailRow icon={Shield} label="Department" value={profile.teams?.length > 0 ? profile.teams[0].teamName : null} />
                            <DetailRow icon={null} label="Worker Type" value={profile.workerType || 'Permanent'} />
                            <DetailRow icon={null} label="Time Type" value={profile.timeType || 'Full Time'} />
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader icon={Building2} title="Teams" gradient="from-cyan-500 to-blue-600" />
                        <div className="px-6 py-4">
                            {profile.teams?.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.teams.map((team) => (
                                        <div
                                            key={team.teamId}
                                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                                        >
                                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                                                <Users className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{team.teamName}</p>
                                                <p className="text-[10px] text-slate-500">{team.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No team memberships</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PublicProfilePage;
