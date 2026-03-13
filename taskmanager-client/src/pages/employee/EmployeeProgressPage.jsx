import { useState, useEffect } from 'react';
import {
    TrendingUp, CheckCircle2, Clock, AlertTriangle, Award,
    Zap, BarChart3, Loader2, Activity, Target
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const EmployeeProgressPage = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                const res = await api.get('/api/employee/progress');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch progress:', err);
                toast.error('Failed to load progress data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-blue-500 to-indigo-500';
        if (score >= 40) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-red-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Outstanding';
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Very Good';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Needs Improvement';
        return 'Below Expectations';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-slate-400">Unable to load progress data</p>
            </div>
        );
    }

    const maxTrend = Math.max(...(data.completionTrend || []).map(t => t.count), 1);
    const maxHours = Math.max(...(data.hoursTrend || []).map(t => t.hours), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            My Progress
                        </h1>
                        <p className="text-indigo-100 text-sm mt-0.5">Your performance metrics and consistency tracking</p>
                    </div>
                </div>
            </div>

            {/* Consistency Score — Hero Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${getScoreGradient(data.consistencyScore)}`} />
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Consistency Score</h2>
                            <p className="text-xs text-slate-500">Based on on-time delivery, completion rate, activity, and feedback</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Main Score */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                            <p className={`text-4xl font-black ${getScoreColor(data.consistencyScore)}`}>
                                {data.consistencyScore}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">/ 100</p>
                            <p className={`text-xs font-bold mt-1 ${getScoreColor(data.consistencyScore)}`}>
                                {getScoreLabel(data.consistencyScore)}
                            </p>
                            <div className="w-full mt-3 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(data.consistencyScore)} transition-all duration-700`}
                                    style={{ width: `${data.consistencyScore}%` }}
                                />
                            </div>
                        </div>
                        {/* Breakdown */}
                        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-emerald-700">{data.onTimeRate}%</p>
                                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">On-Time Rate</p>
                                <p className="text-[9px] text-slate-400">weight: 35%</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-blue-700">{data.completionRate}%</p>
                                <p className="text-[10px] text-blue-600 font-medium mt-0.5">Completion Rate</p>
                                <p className="text-[9px] text-slate-400">weight: 35%</p>
                            </div>
                            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-violet-700">{data.activityRate}%</p>
                                <p className="text-[10px] text-violet-600 font-medium mt-0.5">Activity Rate</p>
                                <p className="text-[9px] text-slate-400">weight: 15%</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-amber-700">{data.avgFeedback > 0 ? data.avgFeedback.toFixed(1) : '—'}</p>
                                <p className="text-[10px] text-amber-600 font-medium mt-0.5">Avg Feedback</p>
                                <p className="text-[9px] text-slate-400">weight: 15%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Assigned</p>
                            <p className="text-2xl font-bold text-slate-800">{data.assignedTasks}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-emerald-600">{data.completedTasks}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-100 rounded-xl">
                            <Clock className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">On-Time</p>
                            <p className="text-2xl font-bold text-teal-600">{data.onTimeCompletedTasks}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Overdue</p>
                            <p className="text-2xl font-bold text-rose-600">{data.overdueTasks}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity & Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-violet-500" />
                        <h3 className="text-sm font-bold text-slate-800">Activity Summary</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="15.9" fill="none"
                                    stroke="url(#activityGrad)" strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${data.activityRate}, 100`}
                                />
                                <defs>
                                    <linearGradient id="activityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-slate-700">{data.activityRate}%</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Days Active</span>
                                <span className="font-bold text-slate-700">{data.daysActive}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Working Days (30d)</span>
                                <span className="font-bold text-slate-700">{data.workingDays}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-800">Feedback Summary</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className={`text-3xl font-black ${data.avgFeedback >= 4 ? 'text-emerald-600' : data.avgFeedback >= 3 ? 'text-blue-600' : data.avgFeedback >= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {data.avgFeedback > 0 ? data.avgFeedback.toFixed(1) : '—'}
                            </p>
                            <p className="text-[10px] text-slate-400">/ 5.0</p>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Feedbacks</span>
                                <span className="font-bold text-slate-700">{data.feedbackCount}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${data.avgFeedback >= 4 ? 'from-emerald-400 to-emerald-500' : data.avgFeedback >= 3 ? 'from-blue-400 to-blue-500' : 'from-amber-400 to-amber-500'}`}
                                    style={{ width: `${(data.avgFeedback / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Completion Trend */}
                {data.completionTrend && data.completionTrend.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-800">Task Completion Trend</h3>
                        </div>
                        <div className="space-y-2">
                            {data.completionTrend.map(item => (
                                <div key={item.month} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 w-20 truncate">{item.label}</span>
                                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                                        <div
                                            className="h-full rounded-lg bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-500"
                                            style={{ width: `${(item.count / maxTrend) * 100}%`, minWidth: item.count > 0 ? '24px' : '0' }}
                                        />
                                        {item.count > 0 && (
                                            <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white mix-blend-difference">
                                                {item.count} tasks
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hours Logged Trend */}
                {data.hoursTrend && data.hoursTrend.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-teal-500" />
                            <h3 className="text-sm font-bold text-slate-800">Hours Logged Trend</h3>
                        </div>
                        <div className="space-y-2">
                            {data.hoursTrend.map(item => (
                                <div key={item.month} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 w-20 truncate">{item.label}</span>
                                    <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                                        <div
                                            className="h-full rounded-lg bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500"
                                            style={{ width: `${(item.hours / maxHours) * 100}%`, minWidth: item.hours > 0 ? '24px' : '0' }}
                                        />
                                        {item.hours > 0 && (
                                            <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white mix-blend-difference">
                                                {item.hours}h
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeProgressPage;
