import { useState, useEffect } from 'react';
import {
    Award, Sparkles, Trophy, Star, Flame, Target, Clock,
    Users, CheckCircle, Zap, Heart, Coffee, Rocket, Lock
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useAuthContext } from '../context/AuthContext';

const AchievementsPage = () => {
    const authCtx = useAuthContext();
    const currentUser = authCtx?.user || { firstName: 'User', userId: 1 };

    const [filter, setFilter] = useState('all');

    // Badge categories and definitions
    const badges = [
        // Productivity
        { id: 1, name: 'First Task', description: 'Complete your first task', icon: CheckCircle, color: 'from-emerald-400 to-emerald-600', category: 'productivity', unlocked: true, unlockedAt: '2026-01-15' },
        { id: 2, name: 'Task Master', description: 'Complete 10 tasks', icon: Target, color: 'from-blue-400 to-blue-600', category: 'productivity', unlocked: true, unlockedAt: '2026-01-22', progress: { current: 10, total: 10 } },
        { id: 3, name: 'Overachiever', description: 'Complete 50 tasks', icon: Trophy, color: 'from-amber-400 to-amber-600', category: 'productivity', unlocked: false, progress: { current: 28, total: 50 } },
        { id: 4, name: 'Centurion', description: 'Complete 100 tasks', icon: Star, color: 'from-purple-400 to-purple-600', category: 'productivity', unlocked: false, progress: { current: 28, total: 100 } },

        // Streaks
        { id: 5, name: 'On Fire', description: '3-day completion streak', icon: Flame, color: 'from-orange-400 to-red-500', category: 'streaks', unlocked: true, unlockedAt: '2026-01-18' },
        { id: 6, name: 'Week Warrior', description: '7-day completion streak', icon: Flame, color: 'from-red-400 to-rose-600', category: 'streaks', unlocked: true, unlockedAt: '2026-02-01' },
        { id: 7, name: 'Unstoppable', description: '30-day completion streak', icon: Rocket, color: 'from-fuchsia-400 to-fuchsia-600', category: 'streaks', unlocked: false, progress: { current: 12, total: 30 } },

        // Focus
        { id: 8, name: 'Deep Focus', description: 'Complete 5 focus sessions', icon: Clock, color: 'from-indigo-400 to-indigo-600', category: 'focus', unlocked: true, unlockedAt: '2026-01-25' },
        { id: 9, name: 'Zen Master', description: 'Complete 50 focus sessions', icon: Coffee, color: 'from-teal-400 to-teal-600', category: 'focus', unlocked: false, progress: { current: 18, total: 50 } },

        // Teamwork
        { id: 10, name: 'Team Player', description: 'Collaborate on 5 team tasks', icon: Users, color: 'from-cyan-400 to-cyan-600', category: 'teamwork', unlocked: true, unlockedAt: '2026-01-28' },
        { id: 11, name: 'Helpful Hand', description: 'Give 10 kudos to teammates', icon: Heart, color: 'from-pink-400 to-pink-600', category: 'teamwork', unlocked: false, progress: { current: 6, total: 10 } },

        // Speed
        { id: 12, name: 'Speed Runner', description: 'Complete 5 tasks before deadline', icon: Zap, color: 'from-yellow-400 to-amber-500', category: 'speed', unlocked: true, unlockedAt: '2026-02-02' },
    ];

    const categories = [
        { key: 'all', label: 'All Badges' },
        { key: 'productivity', label: 'Productivity' },
        { key: 'streaks', label: 'Streaks' },
        { key: 'focus', label: 'Focus' },
        { key: 'teamwork', label: 'Teamwork' },
        { key: 'speed', label: 'Speed' },
    ];

    const filteredBadges = filter === 'all' ? badges : badges.filter(b => b.category === filter);
    const unlockedCount = badges.filter(b => b.unlocked).length;
    const totalXP = badges.filter(b => b.unlocked).length * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Award className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Achievements
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Collect badges and earn XP</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-3xl font-bold">{unlockedCount}/{badges.length}</p>
                            <p className="text-white/70 text-xs">Badges</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-amber-400/30 rounded-lg">
                            <p className="text-3xl font-bold flex items-center gap-1">
                                <Star className="w-5 h-5 fill-amber-300" />
                                {totalXP}
                            </p>
                            <p className="text-white/70 text-xs">Total XP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setFilter(cat.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${filter === cat.key
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges.map((badge) => (
                    <Card
                        key={badge.id}
                        className={`relative overflow-hidden transition-all ${badge.unlocked
                                ? 'hover:shadow-lg hover:-translate-y-1'
                                : 'opacity-60'
                            }`}
                    >
                        {!badge.unlocked && (
                            <div className="absolute top-3 right-3">
                                <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${badge.unlocked
                                    ? `bg-gradient-to-br ${badge.color} shadow-lg`
                                    : 'bg-slate-200'
                                }`}>
                                <badge.icon className={`w-8 h-8 ${badge.unlocked ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <h3 className={`mt-4 font-bold ${badge.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                                {badge.name}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">{badge.description}</p>

                            {badge.unlocked ? (
                                <div className="mt-3 flex items-center justify-center gap-1 text-emerald-500">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Unlocked</span>
                                </div>
                            ) : badge.progress ? (
                                <div className="mt-3">
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${badge.color}`}
                                            style={{ width: `${(badge.progress.current / badge.progress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {badge.progress.current}/{badge.progress.total}
                                    </p>
                                </div>
                            ) : null}

                            {badge.unlocked && badge.unlockedAt && (
                                <p className="text-[10px] text-slate-400 mt-2">
                                    {new Date(badge.unlockedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* XP Info */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-900">How XP Works</h4>
                        <p className="text-sm text-amber-700">
                            Earn 100 XP for each badge you unlock. Complete tasks, maintain streaks, and help teammates to earn more!
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AchievementsPage;
