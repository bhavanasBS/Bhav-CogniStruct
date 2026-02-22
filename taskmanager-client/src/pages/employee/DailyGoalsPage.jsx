import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Sparkles, CheckCircle, Calendar, Loader2, Send,
    Clock, Flame, Mail, XCircle, Eye
} from 'lucide-react';
import Card from '../../components/common/Card';
import { dailyUpdateApi } from '../../api/dailyUpdateApi';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Custom Outlook icon
const OutlookIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4" />
        <path d="M2 8l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0078D4" strokeWidth="0.5" fill="none" />
        <ellipse cx="8" cy="14" rx="3.5" ry="2.5" fill="white" fillOpacity="0.3" />
        <text x="7" y="15.5" fontSize="4" fill="white" fontWeight="bold" fontFamily="Arial">O</text>
    </svg>
);

const DailyGoalsPage = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Employee', email: 'employee@company.com' };

    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [toRecipient, setToRecipient] = useState('');
    const [summary, setSummary] = useState('');
    const [attemptedSend, setAttemptedSend] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    const autoResize = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.max(44, Math.min(el.scrollHeight, 300)) + 'px';
    }, []);

    useEffect(() => { autoResize(); }, [summary, autoResize]);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [todayRes, historyRes] = await Promise.all([
                dailyUpdateApi.getToday(),
                dailyUpdateApi.getMyHistory(),
            ]);
            setTodayStatus(todayRes.data);
            setHistory(historyRes.data || []);
            if (todayRes.data?.summary) setSummary(todayRes.data.summary);
        } catch (error) {
            console.error('Failed to fetch daily update data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleMarkAsSent = async () => {
        try {
            setIsSending(true);
            const res = await dailyUpdateApi.submit({
                isSent: true,
                summary: summary.trim() || null,
            });
            setTodayStatus(res.data);
            toast.success('✅ Daily update marked as sent!');
            // Refresh history
            const historyRes = await dailyUpdateApi.getMyHistory();
            setHistory(historyRes.data || []);
        } catch (error) {
            console.error('Failed to submit daily update:', error);
            toast.error('Failed to mark update as sent');
        } finally {
            setIsSending(false);
        }
    };

    const handleUnmark = async () => {
        try {
            setIsSending(true);
            const res = await dailyUpdateApi.submit({
                isSent: false,
                summary: null,
            });
            setTodayStatus(res.data);
            setSummary('');
            toast.success('Update unmarked');
            const historyRes = await dailyUpdateApi.getMyHistory();
            setHistory(historyRes.data || []);
        } catch (error) {
            toast.error('Failed to update');
        } finally {
            setIsSending(false);
        }
    };

    // Calculate streak
    const calculateStreak = () => {
        let streak = 0;
        const sortedHistory = [...history].sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
        for (const entry of sortedHistory) {
            if (entry.isSent) streak++;
            else break;
        }
        return streak;
    };

    // Week view data
    const getWeekData = () => {
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const entry = history.find(h => h.updateDate?.split('T')[0] === dateStr);
            days.push({
                name: dayNames[i],
                date: date,
                isToday: date.toDateString() === today.toDateString(),
                isSent: entry?.isSent || false,
                isPast: date < today && !days.isToday,
                isFuture: date > today,
            });
        }
        return days;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-[#0078D4] animate-spin" />
            </div>
        );
    }

    const streak = calculateStreak();
    const weekData = getWeekData();
    const isSentToday = todayStatus?.isSent;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0078D4] via-[#106EBE] to-[#005A9E] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <OutlookIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Daily Update
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">{formattedDate}</p>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Flame className="w-6 h-6 text-orange-300" />
                        <div>
                            <p className="text-2xl font-bold">{streak}</p>
                            <p className="text-white/70 text-xs">Day Streak</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Outlook Compose Card */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className={`overflow-hidden ${isSentToday ? 'ring-2 ring-emerald-400 bg-emerald-50/30' : ''}`}>
                        {/* Outlook-style toolbar */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0078D4] to-[#106EBE] text-white">
                            <OutlookIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Manual Daily Update</span>
                            <div className="ml-auto flex items-center gap-2">
                                {isSentToday && (
                                    <span className="flex items-center gap-1 text-xs bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full">
                                        <CheckCircle className="w-3.5 h-3.5" /> Sent
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* From field */}
                            <div className={`flex items-center gap-3 pb-3 border-b ${attemptedSend && !user.email ? 'border-rose-300' : 'border-slate-200'}`}>
                                <span className="text-sm font-semibold text-[#0078D4] w-16 shrink-0">From:<span className="text-rose-500 ml-0.5">*</span></span>
                                <div className="flex items-center gap-2 flex-1">
                                    {user.email ? (
                                        <>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0078D4] to-[#005A9E] flex items-center justify-center text-white text-[10px] font-bold">
                                                {user.firstName?.[0]}{user.lastName?.[0] || ''}
                                            </div>
                                            <div>
                                                <span className="text-sm text-slate-800 font-medium">{user.firstName} {user.lastName || ''}</span>
                                                <span className="text-xs text-slate-400 ml-2">&lt;{user.email}&gt;</span>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-sm text-rose-500 italic">Not available — please update your profile</span>
                                    )}
                                </div>
                                {attemptedSend && !user.email && (
                                    <span className="text-xs text-rose-500 font-medium animate-pulse">Required</span>
                                )}
                            </div>

                            {/* To field — blank text input */}
                            <div className={`flex items-center gap-3 pb-3 border-b ${attemptedSend && !toRecipient.trim() ? 'border-rose-300' : 'border-slate-200'}`}>
                                <span className="text-sm font-semibold text-[#0078D4] w-16 shrink-0">To:<span className="text-rose-500 ml-0.5">*</span></span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={toRecipient}
                                        onChange={(e) => setToRecipient(e.target.value)}
                                        placeholder="Enter recipient name or email (e.g. teamlead@company.com)"
                                        disabled={isSentToday}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${isSentToday
                                                ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                                                : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4]'
                                            }`}
                                    />
                                </div>
                                {attemptedSend && !toRecipient.trim() && (
                                    <span className="text-xs text-rose-500 font-medium animate-pulse">Required</span>
                                )}
                            </div>

                            {/* Subject field */}
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                                <span className="text-sm font-semibold text-[#0078D4] w-16 shrink-0">Subject:</span>
                                <span className="text-sm text-slate-700">
                                    Daily Work Update — {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Summary textarea */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-[#0078D4]" />
                                    Brief Summary
                                    <span className="text-xs text-slate-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    value={summary}
                                    onChange={(e) => { setSummary(e.target.value); autoResize(); }}
                                    placeholder="Briefly describe what you covered in your email update..."
                                    maxLength={500}
                                    rows={1}
                                    disabled={isSentToday}
                                    style={{ minHeight: '44px', maxHeight: '300px', overflow: 'auto' }}
                                    className={`w-full rounded-lg border p-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none ${isSentToday
                                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#0078D4]/20 focus:border-[#0078D4]'
                                        }`}
                                />
                                <p className="text-[10px] text-slate-400 text-right">{summary.length}/500</p>
                            </div>

                            {/* Validation errors */}
                            {attemptedSend && (!user.email || !toRecipient.trim()) && (
                                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    <span>
                                        {!user.email && !toRecipient.trim()
                                            ? 'Both From and To fields are required before marking as sent.'
                                            : !user.email
                                                ? 'From field is required — your email is not set. Please update your profile.'
                                                : 'To field is required — please enter the recipient.'}
                                    </span>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                {!isSentToday ? (
                                    <button
                                        onClick={() => {
                                            if (!user.email || !toRecipient.trim()) {
                                                setAttemptedSend(true);
                                                toast.error(!user.email && !toRecipient.trim()
                                                    ? 'Both From and To are required'
                                                    : !user.email
                                                        ? 'From (your email) is required'
                                                        : 'To (recipient) is required');
                                                return;
                                            }
                                            handleMarkAsSent();
                                        }}
                                        disabled={isSending}
                                        className={`flex items-center gap-2 px-6 py-2.5 font-semibold rounded-lg shadow-md transition-all cursor-pointer ${attemptedSend && (!user.email || !toRecipient.trim())
                                            ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                                            : 'bg-[#0078D4] hover:bg-[#106EBE] text-white shadow-blue-500/20 disabled:opacity-60'
                                            }`}
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Mark as Sent
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Update Sent ✓
                                        </div>
                                        <button
                                            onClick={handleUnmark}
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Undo
                                        </button>
                                    </div>
                                )}

                                {todayStatus?.acknowledgedByName && (
                                    <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                        <Eye className="w-3.5 h-3.5" />
                                        Acknowledged by {todayStatus.acknowledgedByName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Update History */}
                    <Card>
                        <div className="px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#0078D4] to-[#005A9E] rounded-lg flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Update History</h3>
                                <span className="text-xs text-slate-400 ml-auto">Last 30 days</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No update history yet</p>
                                </div>
                            ) : (
                                history.map((entry) => (
                                    <div key={entry.dailyUpdateId || entry.updateDate} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.isSent
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-rose-100 text-rose-500'
                                            }`}>
                                            {entry.isSent ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">
                                                {new Date(entry.updateDate).toLocaleDateString('en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric'
                                                })}
                                            </p>
                                            {entry.summary && (
                                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">{entry.summary}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {entry.isSent ? (
                                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Sent</span>
                                            ) : (
                                                <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Missed</span>
                                            )}
                                            {entry.acknowledgedByName && (
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Ack'd
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Today's Status */}
                    <Card className={isSentToday ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}>
                        <div className="p-6 text-center">
                            {isSentToday ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-emerald-700 mb-2">Update Sent!</h3>
                                    <p className="text-sm text-emerald-600">
                                        Great job keeping your team informed.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-amber-700 mb-2">Pending</h3>
                                    <p className="text-sm text-amber-600">
                                        Don't forget to send your daily update via Outlook!
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Week View */}
                    <Card>
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#0078D4]" />
                                <h3 className="font-semibold text-slate-800">This Week</h3>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between">
                                {weekData.map((day) => (
                                    <div key={day.name} className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-slate-400 uppercase">{day.name}</span>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${day.isToday
                                            ? isSentToday
                                                ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                                                : 'bg-[#0078D4] text-white ring-2 ring-blue-300'
                                            : day.isSent
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : day.isPast
                                                    ? 'bg-rose-100 text-rose-400'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {day.isSent || (day.isToday && isSentToday) ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : day.isToday ? (
                                                <OutlookIcon className="w-4 h-4" />
                                            ) : day.isPast ? (
                                                <XCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                <span className="text-xs">{day.date.getDate()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-[#0078D4]/20">
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <OutlookIcon className="w-4 h-4" />
                                <p className="text-xs font-semibold text-[#0078D4] uppercase tracking-wider">How It Works</p>
                            </div>
                            <ol className="text-sm text-slate-700 space-y-1.5 list-decimal list-inside">
                                <li>Open <strong>Outlook</strong> and compose your daily update</li>
                                <li>Send it to your team lead</li>
                                <li>Come back here and click <strong>"Mark as Sent"</strong></li>
                            </ol>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DailyGoalsPage;
