import { useState, useEffect } from 'react';
import {
    Award, Loader2, TrendingUp, User,
    Calendar, ChevronRight, MessageSquare, ClipboardList
} from 'lucide-react';
import Card from '../../components/common/Card';
import { reviewApi } from '../../api/reviewApi';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const EmployeeReviewsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [activeTab, setActiveTab] = useState('reviews');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [reviewRes, feedbackRes] = await Promise.allSettled([
                    reviewApi.getMyReviews(),
                    api.get('/api/feedback/mine')
                ]);
                setReviews(reviewRes.status === 'fulfilled' ? (reviewRes.value.data || []) : []);
                setFeedbacks(feedbackRes.status === 'fulfilled' ? (feedbackRes.value.data || []) : []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                toast.error('Failed to load reviews.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-rose-600 bg-rose-50 border-rose-200';
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



    const avgScore = reviews.length > 0
        ? Math.round(reviews.reduce((sum, r) => sum + r.performanceScore, 0) / reviews.length)
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-[#0078D4] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Award className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            My Performance Reviews
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Manager reviews and task feedback</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                    <div className="p-5 text-center">
                        <TrendingUp className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-violet-700">{reviews.length}</h3>
                        <p className="text-xs text-violet-500">Manager Reviews</p>
                    </div>
                </Card>
                <Card className={`border ${getScoreColor(avgScore)}`}>
                    <div className="p-5 text-center">
                        <Award className="w-6 h-6 mx-auto mb-2" />
                        <h3 className="text-2xl font-bold">{avgScore}/100</h3>
                        <p className="text-xs">Average Score</p>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                    <div className="p-5 text-center">
                        <MessageSquare className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-indigo-700">{feedbacks.length}</h3>
                        <p className="text-xs text-indigo-500">Task Feedbacks</p>
                    </div>
                </Card>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'reviews'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Award className="w-4 h-4" /> Manager Reviews ({reviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'feedback'
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <MessageSquare className="w-4 h-4" /> Task Feedback ({feedbacks.length})
                </button>
            </div>

            {/* Manager Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <Card>
                            <div className="p-12 text-center text-slate-400">
                                <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold text-slate-500 mb-1">No Reviews Yet</h3>
                                <p className="text-sm">Your manager has not submitted any performance reviews yet.</p>
                            </div>
                        </Card>
                    ) : (
                        reviews.map(r => (
                            <Card key={r.reviewId} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`h-1.5 bg-gradient-to-r ${getScoreGradient(r.performanceScore)}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-lg font-bold text-slate-900">{r.reviewPeriod}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Reviewed by <strong>{r.managerName}</strong></span>
                                                <span className="text-slate-300">•</span>
                                                <span>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-lg font-bold border ${getScoreColor(r.performanceScore)}`}>
                                            {r.performanceScore}<span className="text-xs font-normal opacity-70">/100</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getScoreGradient(r.performanceScore)} rounded-full transition-all`}
                                            style={{ width: `${r.performanceScore}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {r.strengths && (
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <ChevronRight className="w-3 h-3" /> Strengths
                                                </h4>
                                                <p className="text-sm text-emerald-800">{r.strengths}</p>
                                            </div>
                                        )}
                                        {r.improvementAreas && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                    <ChevronRight className="w-3 h-3" /> Areas for Improvement
                                                </h4>
                                                <p className="text-sm text-amber-800">{r.improvementAreas}</p>
                                            </div>
                                        )}
                                    </div>
                                    {r.comment && (
                                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Additional Comments</h4>
                                            <p className="text-sm text-slate-700">{r.comment}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Task Feedback Tab */}
            {activeTab === 'feedback' && (
                <div className="space-y-4">
                    {feedbacks.length === 0 ? (
                        <Card>
                            <div className="p-12 text-center text-slate-400">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold text-slate-500 mb-1">No Task Feedback Yet</h3>
                                <p className="text-sm">Your team lead has not submitted any task feedback yet.</p>
                            </div>
                        </Card>
                    ) : (
                        feedbacks.map(f => {
                            const overall = f.overallRating || ((f.workQualityRating + f.timelinessRating + f.communicationRating) / 3);
                            const overallColor = overall >= 4 ? 'text-emerald-600' : overall >= 3 ? 'text-blue-600' : overall >= 2 ? 'text-amber-600' : 'text-rose-600';
                            const overallGradient = overall >= 4 ? 'from-emerald-500 to-teal-500' : overall >= 3 ? 'from-blue-500 to-indigo-500' : overall >= 2 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-red-500';

                            return (
                            <Card key={f.feedbackId} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`h-1.5 bg-gradient-to-r ${overallGradient}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <ClipboardList className="w-4 h-4 text-indigo-500" />
                                                <h3 className="text-base font-bold text-slate-900">{f.taskTitle}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Feedback by <strong>{f.teamLeadName}</strong></span>
                                                <span className="text-slate-300">•</span>
                                                <span>{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-2xl font-bold ${overallColor}`}>{overall.toFixed ? overall.toFixed(1) : overall}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">/ 5</p>
                                            <p className={`text-xs font-semibold mt-0.5 ${overallColor}`}>{f.overallLabel || ''}</p>
                                        </div>
                                    </div>

                                    {/* Rating Bars */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {[
                                            { label: 'Work Quality', value: f.workQualityRating },
                                            { label: 'Timeliness', value: f.timelinessRating },
                                            { label: 'Communication', value: f.communicationRating },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-slate-500">{label}</span>
                                                    <span className="text-xs font-bold text-slate-700">{value}/5</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r ${value >= 4 ? 'from-emerald-400 to-emerald-500' : value >= 3 ? 'from-blue-400 to-blue-500' : value >= 2 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500'}`}
                                                        style={{ width: `${(value / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Strengths & Improvements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {f.strengths && (
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">Strengths</h4>
                                                <p className="text-sm text-emerald-800">{f.strengths}</p>
                                            </div>
                                        )}
                                        {f.improvements && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">Areas for Improvement</h4>
                                                <p className="text-sm text-amber-800">{f.improvements}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeReviewsPage;
