import { useState, useEffect } from 'react';
import {
    Star, Loader2, TrendingUp, Award, ChevronDown,
    Send, Users, BarChart3, FileText
} from 'lucide-react';
import Card from '../../components/common/Card';
import { reviewApi } from '../../api/reviewApi';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const ManagerReviewPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({
        employeeId: '',
        reviewPeriod: '',
        performanceScore: 70,
        strengths: '',
        improvementAreas: '',
        comment: '',
    });

    const periodOptions = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const periods = [];
        for (let i = 0; i < 6; i++) {
            const m = (month - i + 12) % 12;
            const y = month - i < 0 ? year - 1 : year;
            periods.push(`${months[m]} ${y}`);
        }
        return periods;
    })();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [empRes, reviewsRes] = await Promise.all([
                api.get('/api/users/employees'),
                reviewApi.getTeamReviews(),
            ]);
            const members = empRes.data || [];
            setTeamMembers(Array.isArray(members) ? members : []);
            setReviews(reviewsRes.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        if (!form.employeeId) return toast.error('Select an employee.');
        if (!form.reviewPeriod) return toast.error('Select a review period.');
        if (form.performanceScore < 0 || form.performanceScore > 100) return toast.error('Score must be 0–100.');

        try {
            setSubmitting(true);
            const res = await reviewApi.create({
                employeeId: Number(form.employeeId),
                reviewPeriod: form.reviewPeriod,
                performanceScore: Number(form.performanceScore),
                strengths: form.strengths || null,
                improvementAreas: form.improvementAreas || null,
                comment: form.comment || null,
            });
            toast.success(res.data?.message || 'Review submitted!');
            setForm({ employeeId: '', reviewPeriod: '', performanceScore: 70, strengths: '', improvementAreas: '', comment: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50';
        if (score >= 60) return 'text-blue-600 bg-blue-50';
        if (score >= 40) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-blue-500 to-indigo-500';
        if (score >= 40) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-red-500';
    };

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
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
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
                            Performance Reviews
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Evaluate employee performance across your teams</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Review Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">New Performance Review</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Employee + Period */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Employee <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={form.employeeId}
                                            onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select employee...</option>
                                            {teamMembers.map(m => (
                                                <option key={m.userId || m.id} value={m.userId || m.id}>
                                                    {m.firstName || m.name} {m.lastName || ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Review Period <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={form.reviewPeriod}
                                            onChange={e => setForm(p => ({ ...p, reviewPeriod: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select period...</option>
                                            {periodOptions.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Performance Score */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                                    Performance Score <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={form.performanceScore}
                                        onChange={e => setForm(p => ({ ...p, performanceScore: Number(e.target.value) }))}
                                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-500"
                                    />
                                    <div className={`px-3 py-1.5 rounded-lg text-lg font-bold min-w-[60px] text-center ${getScoreColor(form.performanceScore)}`}>
                                        {form.performanceScore}
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                                    <span>Poor</span>
                                    <span>Needs Improvement</span>
                                    <span>Good</span>
                                    <span>Excellent</span>
                                </div>
                            </div>

                            {/* Strengths */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Strengths</label>
                                <textarea
                                    value={form.strengths}
                                    onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
                                    rows={2}
                                    maxLength={1000}
                                    placeholder="e.g. Great UI implementation, consistent delivery..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none resize-none"
                                />
                            </div>

                            {/* Improvement Areas */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Areas for Improvement</label>
                                <textarea
                                    value={form.improvementAreas}
                                    onChange={e => setForm(p => ({ ...p, improvementAreas: e.target.value }))}
                                    rows={2}
                                    maxLength={1000}
                                    placeholder="e.g. Improve estimation accuracy, documentation..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none resize-none"
                                />
                            </div>

                            {/* Additional Comments */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Additional Comments</label>
                                <textarea
                                    value={form.comment}
                                    onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                                    rows={2}
                                    maxLength={1000}
                                    placeholder="Any additional notes..."
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md shadow-violet-500/20 transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-8 h-8 text-violet-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-violet-700">{reviews.length}</h3>
                            <p className="text-sm text-violet-600">Reviews Submitted</p>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-blue-700">{teamMembers.length}</h3>
                            <p className="text-sm text-blue-600">Team Members</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Past Reviews */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Submitted Reviews</h3>
                        <span className="text-xs text-slate-400 ml-auto">{reviews.length} total</span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {reviews.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No reviews submitted yet</p>
                        </div>
                    ) : (
                        reviews.map(r => (
                            <div key={r.reviewId} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{r.employeeName}</h4>
                                        <p className="text-xs text-slate-400">{r.reviewPeriod} • {new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(r.performanceScore)}`}>
                                        {r.performanceScore}/100
                                    </div>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full bg-gradient-to-r ${getScoreGradient(r.performanceScore)} rounded-full transition-all`}
                                        style={{ width: `${r.performanceScore}%` }}
                                    />
                                </div>
                                {r.strengths && (
                                    <p className="text-xs text-emerald-600 mt-1"><strong>Strengths:</strong> {r.strengths}</p>
                                )}
                                {r.improvementAreas && (
                                    <p className="text-xs text-amber-600 mt-1"><strong>Improve:</strong> {r.improvementAreas}</p>
                                )}
                                {r.comment && (
                                    <p className="text-xs text-slate-500 mt-1">{r.comment}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ManagerReviewPage;
