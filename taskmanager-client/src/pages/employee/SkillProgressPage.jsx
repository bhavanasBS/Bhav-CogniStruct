import { useState, useEffect } from 'react';
import {
    TrendingUp, Award, Send, CheckCircle, Clock, AlertCircle,
    Zap, BookOpen, Target, BarChart3, ArrowUpRight,
    Loader2, Shield, XCircle
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const SkillProgressPage = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [requestReason, setRequestReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [consistency, setConsistency] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [skillsRes, consistencyRes] = await Promise.allSettled([
                    api.get('/api/skills/analytics'),
                    (() => {
                        const token = localStorage.getItem('token');
                        if (token) {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            const userId = payload.UserId || payload.sub;
                            if (userId) return api.get(`/api/analytics/employee/${userId}/consistency`);
                        }
                        return Promise.reject('No token');
                    })()
                ]);
                if (skillsRes.status === 'fulfilled') setData(skillsRes.value.data);
                if (consistencyRes.status === 'fulfilled') setConsistency(consistencyRes.value.data);
            } catch (err) {
                console.error('Failed to fetch skill data:', err);
                toast.error('Failed to load skill analytics');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRequestTraining = (skill) => {
        setSelectedSkill(skill);
        setRequestReason('');
        setShowRequestModal(true);
    };

    const submitTrainingRequest = async () => {
        if (!selectedSkill) return;
        try {
            setSubmitting(true);
            await api.post('/api/skills/training-request', {
                skillName: selectedSkill.name || selectedSkill,
                reason: requestReason
            });
            toast.success('Training request submitted!');
            setShowRequestModal(false);
            // Refresh data
            const res = await api.get('/api/skills/analytics');
            setData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const getLevelLabel = (level) => ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][level] || '—';
    const getLevelColor = (level) => {
        if (level >= 4) return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', light: 'bg-emerald-50' };
        if (level >= 3) return { text: 'text-blue-600', bg: 'bg-blue-500', border: 'border-blue-200', light: 'bg-blue-50' };
        if (level >= 2) return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', light: 'bg-amber-50' };
        return { text: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200', light: 'bg-rose-50' };
    };

    const categories = data?.skills
        ? ['all', ...new Set(data.skills.map(s => s.category))]
        : ['all'];

    const filteredSkills = selectedCategory === 'all'
        ? (data?.skills || [])
        : (data?.skills || []).filter(s => s.category === selectedCategory);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    const summary = data?.summary || { total: 0, strong: 0, improving: 0, needsFocus: 0, avgLevel: 0 };
    const recommendedSkills = data?.recommendedSkills || [];
    const trainingRequests = data?.trainingRequests || [];

    // Top skills for usage chart (sort by tasksUsed)
    const topUsedSkills = [...(data?.skills || [])].sort((a, b) => b.tasksUsed - a.tasksUsed).slice(0, 8);
    const maxTasksUsed = Math.max(...topUsedSkills.map(s => s.tasksUsed), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Skill Analytics & Progress
                        </h1>
                        <p className="text-violet-100 text-sm mt-0.5">Track your professional growth and skill development</p>
                    </div>
                </div>
            </div>

            {/* Consistency Score */}
            {consistency && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Consistency Score</h3>
                            <p className="text-xs text-slate-500">Based on task performance analysis</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-indigo-100 text-center">
                            <p className="text-3xl font-bold text-indigo-700">{Math.round(consistency.score)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {consistency.score >= 80 ? 'Excellent' : consistency.score >= 60 ? 'Very Good' : consistency.score >= 40 ? 'Good' : 'Needs Improvement'}
                            </p>
                            <div className="mt-2 h-2 bg-indigo-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${consistency.score}%` }} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                            <p className="text-2xl font-bold text-emerald-600">{Math.round((consistency.completionRate || 0) * 100)}%</p>
                            <p className="text-xs text-slate-500">Completion Rate</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-blue-100 text-center">
                            <p className="text-2xl font-bold text-blue-600">{Math.round((consistency.onTimeRate || 0) * 100)}%</p>
                            <p className="text-xs text-slate-500">On-Time Rate</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-amber-100 text-center">
                            <p className="text-2xl font-bold text-amber-600">{consistency.totalAssigned || 0}</p>
                            <p className="text-xs text-slate-500">Tasks Assigned</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-100 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Skills Tracked</p>
                            <p className="text-2xl font-bold text-slate-800">{summary.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Strong Skills</p>
                            <p className="text-2xl font-bold text-emerald-600">{summary.strong}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Improving</p>
                            <p className="text-2xl font-bold text-blue-600">{summary.improving}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 rounded-xl">
                            <Target className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Needs Focus</p>
                            <p className="text-2xl font-bold text-rose-600">{summary.needsFocus}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skill Usage Chart */}
            {topUsedSkills.length > 0 && topUsedSkills.some(s => s.tasksUsed > 0) && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Skill Usage in Tasks
                    </h2>
                    <div className="space-y-3">
                        {topUsedSkills.filter(s => s.tasksUsed > 0).map(skill => (
                            <div key={skill.name} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700 w-28 truncate">{skill.name}</span>
                                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                                    <div
                                        className={`h-full rounded-lg ${getLevelColor(skill.skillLevel).bg} transition-all duration-500`}
                                        style={{ width: `${(skill.tasksUsed / maxTasksUsed) * 100}%`, minWidth: '24px' }}
                                    />
                                    <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white mix-blend-difference">
                                        {skill.tasksUsed} tasks
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-500 w-14 text-right">{skill.successRate}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${selectedCategory === cat
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        {cat === 'all' ? 'All Skills' : cat}
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-500">No skills found</h3>
                    <p className="text-sm text-slate-400 mt-1">Skills will appear here once they are added to your profile.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map(skill => {
                        const colors = getLevelColor(skill.skillLevel);
                        return (
                            <div key={skill.name} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{skill.name}</h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-semibold uppercase tracking-wide">{skill.category}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg border ${colors.border} ${colors.light}`}>
                                        <span className={`text-lg font-bold ${colors.text}`}>{skill.skillLevel}</span>
                                        <span className="text-xs text-slate-400">/5</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-slate-500">{getLevelLabel(skill.skillLevel)}</span>
                                        <span className="text-xs font-bold text-slate-500">{skill.skillLevel * 20}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.bg} transition-all duration-700`}
                                            style={{ width: `${skill.skillLevel * 20}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                                        <p className="text-lg font-bold text-slate-700">{skill.tasksUsed}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Tasks Used In</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                                        <p className={`text-lg font-bold ${skill.successRate >= 70 ? 'text-emerald-600' : skill.successRate >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {skill.tasksUsed > 0 ? `${skill.successRate}%` : '—'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">Success Rate</p>
                                    </div>
                                </div>

                                {/* Training Button */}
                                {skill.needsTraining && (
                                    <button
                                        onClick={() => handleRequestTraining(skill)}
                                        className="w-full mt-1 px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 text-violet-700 rounded-xl text-xs font-semibold hover:from-violet-100 hover:to-purple-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Request Training
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recommended Skills */}
            {recommendedSkills.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        Recommended Skills to Learn
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">Based on skills required by your assigned tasks that you don't have yet</p>
                    <div className="flex flex-wrap gap-2">
                        {recommendedSkills.map(rs => (
                            <button
                                key={rs.name}
                                onClick={() => handleRequestTraining(rs)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-200 rounded-xl hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
                            >
                                <span className="text-sm font-semibold text-slate-700">{rs.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-bold">{rs.demandCount} tasks</span>
                                <BookOpen className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Training Requests */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    Training Requests
                </h2>
                {trainingRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No training requests yet</p>
                        <p className="text-xs text-slate-300 mt-1">Request training for skills that need improvement</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {trainingRequests.map(request => (
                            <div key={request.requestId} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{request.skillName}</p>
                                    {request.reason && <p className="text-xs text-slate-500 mt-0.5">{request.reason}</p>}
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {request.status === 'approved' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    {request.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                                    {request.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-500" />}
                                    <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-md ${
                                        request.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                                        : request.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                        : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Training Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Request Training</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Request training for <span className="text-violet-600 font-semibold">{selectedSkill?.name || selectedSkill}</span>
                        </p>
                        <textarea
                            value={requestReason}
                            onChange={e => setRequestReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 mb-4 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none text-sm"
                            rows={3}
                            placeholder="Why do you want this training? (optional)"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitTrainingRequest}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillProgressPage;
