import { useState, useEffect } from 'react';
import {
    Target, Sparkles, Plus, Trash2, CheckCircle,
    Star, Trophy, Flame, Calendar, Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const DailyGoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [streak, setStreak] = useState(7);
    const [isLoading, setIsLoading] = useState(false);

    // Load goals from localStorage
    useEffect(() => {
        const savedGoals = localStorage.getItem('daily_goals');
        const savedDate = localStorage.getItem('goals_date');
        const today = new Date().toDateString();

        if (savedGoals && savedDate === today) {
            setGoals(JSON.parse(savedGoals));
        } else {
            // Reset goals for new day
            setGoals([
                { id: 1, text: 'Complete 3 tasks', done: false },
                { id: 2, text: 'Log 4 hours of work', done: false },
                { id: 3, text: 'Review pending items', done: false },
            ]);
        }

        const savedStreak = localStorage.getItem('goal_streak');
        if (savedStreak) setStreak(parseInt(savedStreak));
    }, []);

    // Save goals to localStorage
    useEffect(() => {
        if (goals.length > 0) {
            localStorage.setItem('daily_goals', JSON.stringify(goals));
            localStorage.setItem('goals_date', new Date().toDateString());
        }
    }, [goals]);

    const addGoal = () => {
        if (!newGoal.trim()) return;
        const goal = {
            id: Date.now(),
            text: newGoal.trim(),
            done: false,
        };
        setGoals([...goals, goal]);
        setNewGoal('');
        toast.success('Goal added!');
    };

    const toggleGoal = (id) => {
        setGoals(goals.map(g =>
            g.id === id ? { ...g, done: !g.done } : g
        ));
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const completedCount = goals.filter(g => g.done).length;
    const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;
    const allCompleted = goals.length > 0 && completedCount === goals.length;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Daily Goals
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Set your priorities for today</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Goals List */}
                <div className="col-span-2 space-y-4">
                    {/* Add Goal */}
                    <Card>
                        <div className="p-4 flex gap-3">
                            <input
                                type="text"
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                                placeholder="Add a new goal..."
                                className="flex-1 h-10 px-4 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                            />
                            <Button icon={Plus} onClick={addGoal}>Add Goal</Button>
                        </div>
                    </Card>

                    {/* Goals */}
                    <Card>
                        <div className="px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">Today's Goals</h3>
                                <span className="text-sm text-slate-500">
                                    {completedCount} of {goals.length} completed
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${allCompleted
                                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {goals.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No goals set for today</p>
                                </div>
                            ) : (
                                goals.map((goal, index) => (
                                    <div
                                        key={goal.id}
                                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${goal.done ? 'bg-emerald-50' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleGoal(goal.id)}
                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${goal.done
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-slate-300 hover:border-emerald-400'
                                                }`}
                                        >
                                            {goal.done && <CheckCircle className="w-4 h-4 text-white" />}
                                        </button>
                                        <div className="flex-1">
                                            <p className={`font-medium ${goal.done ? 'text-emerald-700 line-through' : 'text-slate-800'
                                                }`}>
                                                {goal.text}
                                            </p>
                                        </div>
                                        {goal.done && (
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        )}
                                        <button
                                            onClick={() => deleteGoal(goal.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Completion Status */}
                    <Card className={allCompleted ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : ''}>
                        <div className="p-6 text-center">
                            {allCompleted ? (
                                <>
                                    <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-amber-700 mb-2">All Goals Complete!</h3>
                                    <p className="text-sm text-amber-600">Amazing work today! Keep the streak going.</p>
                                </>
                            ) : (
                                <>
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                            <circle
                                                cx="48" cy="48" r="40"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 40}
                                                strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-slate-800">{Math.round(progress)}%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {goals.length - completedCount} goals remaining
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Week View */}
                    <Card>
                        <div className="px-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                <h3 className="font-semibold text-slate-800">This Week</h3>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between">
                                {weekDays.map((day, i) => (
                                    <div key={day} className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-slate-400 uppercase">{day}</span>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === today
                                                ? 'bg-indigo-500 text-white'
                                                : i < today
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {i < today ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : i === today ? (
                                                <Star className="w-4 h-4" />
                                            ) : (
                                                <span className="text-xs">{i + 1}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                        <div className="p-4">
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">Productivity Tip</p>
                            <p className="text-sm text-violet-800">
                                Set 3 meaningful goals each day. Quality over quantity leads to better focus and satisfaction!
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DailyGoalsPage;
