import { useState, useEffect } from 'react';
import {
    Heart, Sparkles, Smile, Meh, Frown, Send,
    Users, TrendingUp, MessageCircle, BarChart3, Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TeamPulse = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Manager', userId: 1 };

    const [isLoading, setIsLoading] = useState(false);
    const [question, setQuestion] = useState('How are you feeling about your current workload?');
    const [responses, setResponses] = useState([
        { id: 1, user: 'Priya Sharma', mood: 'good', comment: 'Feeling productive!', timestamp: new Date() },
        { id: 2, user: 'Rahul Kumar', mood: 'neutral', comment: 'A bit busy but managing.', timestamp: new Date() },
        { id: 3, user: 'Ananya Patel', mood: 'good', comment: 'Great team support!', timestamp: new Date() },
    ]);
    const [pulseHistory, setPulseHistory] = useState([
        { date: '2026-02-08', good: 5, neutral: 2, bad: 1 },
        { date: '2026-02-07', good: 4, neutral: 3, bad: 0 },
        { date: '2026-02-06', good: 6, neutral: 1, bad: 1 },
        { date: '2026-02-05', good: 3, neutral: 4, bad: 1 },
        { date: '2026-02-04', good: 5, neutral: 2, bad: 0 },
    ]);

    const moodOptions = [
        { value: 'good', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-100 hover:bg-emerald-500', label: 'Good' },
        { value: 'neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-100 hover:bg-amber-500', label: 'Okay' },
        { value: 'bad', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-100 hover:bg-rose-500', label: 'Stressed' },
    ];

    const handleSendPulse = () => {
        if (!question.trim()) {
            toast.error('Please enter a question');
            return;
        }
        toast.success('Pulse survey sent to team!');
    };

    const totalResponses = responses.length;
    const moodCounts = {
        good: responses.filter(r => r.mood === 'good').length,
        neutral: responses.filter(r => r.mood === 'neutral').length,
        bad: responses.filter(r => r.mood === 'bad').length,
    };
    const averageMood = moodCounts.good > moodCounts.bad ? 'Positive' : moodCounts.bad > moodCounts.good ? 'Needs Attention' : 'Neutral';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Heart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Team Pulse
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Check in with your team's wellbeing</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{totalResponses}</p>
                            <p className="text-white/70 text-xs">Responses</p>
                        </div>
                        <div className={`text-center px-4 py-2 rounded-lg ${averageMood === 'Positive' ? 'bg-emerald-400/30' :
                                averageMood === 'Needs Attention' ? 'bg-rose-400/30' : 'bg-amber-400/30'
                            }`}>
                            <p className="text-xl font-bold">{averageMood}</p>
                            <p className="text-white/70 text-xs">Team Mood</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Send Pulse */}
                <Card className="col-span-2">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800">Quick Pulse Check</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Ask your team:
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="How are you feeling today?"
                                className="w-full h-12 px-4 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button icon={Send} onClick={handleSendPulse}>
                                Send to Team
                            </Button>
                            <button
                                onClick={() => setQuestion('How are you feeling about your current workload?')}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                Use Template
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Mood Summary */}
                <Card>
                    <div className="px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-indigo-500" />
                            <h3 className="font-semibold text-slate-800">Today's Mood</h3>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {moodOptions.map((mood) => {
                            const count = moodCounts[mood.value];
                            const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                            return (
                                <div key={mood.value}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <mood.icon className={`w-5 h-5 ${mood.color}`} />
                                            <span className="text-sm text-slate-600">{mood.label}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${mood.value === 'good' ? 'bg-emerald-500' :
                                                    mood.value === 'neutral' ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Recent Responses */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800">Recent Responses</h3>
                    </div>
                    <Badge variant="info">{responses.length} responses</Badge>
                </div>
                <div className="divide-y divide-slate-100">
                    {responses.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No responses yet</p>
                        </div>
                    ) : (
                        responses.map((response) => {
                            const moodConfig = moodOptions.find(m => m.value === response.mood);
                            return (
                                <div
                                    key={response.id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${response.mood === 'good' ? 'bg-emerald-100' :
                                                response.mood === 'neutral' ? 'bg-amber-100' : 'bg-rose-100'
                                            }`}>
                                            {moodConfig && <moodConfig.icon className={`w-5 h-5 ${moodConfig.color}`} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{response.user}</p>
                                            <p className="text-sm text-slate-500">{response.comment}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Pulse History */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800">Pulse Trend (Last 5 Days)</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-end justify-between gap-4 h-40">
                        {pulseHistory.map((day, index) => {
                            const total = day.good + day.neutral + day.bad;
                            const goodPercent = (day.good / total) * 100;
                            const neutralPercent = (day.neutral / total) * 100;
                            const badPercent = (day.bad / total) * 100;

                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full h-32 flex flex-col-reverse rounded-lg overflow-hidden">
                                        <div
                                            className="bg-emerald-500 transition-all"
                                            style={{ height: `${goodPercent}%` }}
                                            title={`Good: ${day.good}`}
                                        />
                                        <div
                                            className="bg-amber-500 transition-all"
                                            style={{ height: `${neutralPercent}%` }}
                                            title={`Neutral: ${day.neutral}`}
                                        />
                                        <div
                                            className="bg-rose-500 transition-all"
                                            style={{ height: `${badPercent}%` }}
                                            title={`Stressed: ${day.bad}`}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {moodOptions.map((mood) => (
                            <div key={mood.value} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${mood.value === 'good' ? 'bg-emerald-500' :
                                        mood.value === 'neutral' ? 'bg-amber-500' : 'bg-rose-500'
                                    }`} />
                                <span className="text-xs text-slate-500">{mood.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TeamPulse;
