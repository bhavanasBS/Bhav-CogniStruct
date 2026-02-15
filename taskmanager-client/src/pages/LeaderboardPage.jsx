import { useState, useEffect } from 'react';
import {
    Trophy, Sparkles, Star, Medal, Crown, TrendingUp,
    Flame, Target, Award, Users, ArrowUpRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useAuthContext } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';

const LeaderboardPage = () => {
    const authCtx = useAuthContext();
    const currentUser = authCtx?.user || { firstName: 'User', userId: 1 };

    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('week');
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);

    // Mock leaderboard data
    const mockData = [
        { id: 1, name: 'Priya Sharma', avatar: 'PS', points: 2450, tasks: 28, streak: 12, team: 'Frontend' },
        { id: 2, name: 'Rahul Kumar', avatar: 'RK', points: 2280, tasks: 25, streak: 8, team: 'Backend' },
        { id: 3, name: 'Ananya Patel', avatar: 'AP', points: 2100, tasks: 22, streak: 15, team: 'Design' },
        { id: 4, name: 'Vikram Singh', avatar: 'VS', points: 1950, tasks: 20, streak: 6, team: 'QA' },
        { id: 5, name: 'Sneha Reddy', avatar: 'SR', points: 1820, tasks: 18, streak: 10, team: 'Frontend' },
        { id: 6, name: 'Arjun Nair', avatar: 'AN', points: 1650, tasks: 16, streak: 5, team: 'Backend' },
        { id: 7, name: 'Meera Iyer', avatar: 'MI', points: 1500, tasks: 15, streak: 7, team: 'Design' },
        { id: 8, name: 'Karthik Menon', avatar: 'KM', points: 1380, tasks: 14, streak: 4, team: 'DevOps' },
    ];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                // In real app, fetch from API
                await new Promise(r => setTimeout(r, 500));
                setLeaderboard(mockData);
                // Find current user rank (mock)
                const userIndex = Math.floor(Math.random() * 8);
                setMyRank(userIndex + 1);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [timeframe]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-amber-500" />;
            case 2: return <Medal className="w-6 h-6 text-slate-400" />;
            case 3: return <Medal className="w-6 h-6 text-amber-700" />;
            default: return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
            case 2: return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
            case 3: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
            default: return 'bg-white border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Leaderboard
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Top performers this {timeframe}</p>
                        </div>
                    </div>

                    {myRank && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Star className="w-6 h-6 text-amber-300" />
                            <div>
                                <p className="text-3xl font-bold">#{myRank}</p>
                                <p className="text-white/70 text-xs">Your Rank</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeframe Filter */}
            <div className="flex gap-2">
                {[
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                    { key: 'all', label: 'All Time' },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTimeframe(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${timeframe === t.key
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((user, index) => {
                    const position = index === 0 ? 1 : index === 1 ? 2 : 3;
                    const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
                    const order = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };

                    return (
                        <div key={user.id} className={`${order[position]} flex flex-col items-center`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold text-white ${position === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                                    position === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                                        'bg-gradient-to-br from-orange-400 to-orange-600'
                                }`}>
                                {user.avatar}
                            </div>
                            <p className="font-semibold text-slate-800 mt-2">{user.name}</p>
                            <div className="flex items-center gap-1 text-amber-500 mt-1">
                                <Star className="w-4 h-4 fill-amber-400" />
                                <span className="font-bold">{user.points}</span>
                            </div>
                            <div className={`w-full ${heights[position]} bg-gradient-to-t mt-3 rounded-t-xl ${position === 1 ? 'from-amber-500 to-amber-400' :
                                    position === 2 ? 'from-slate-400 to-slate-300' :
                                        'from-orange-500 to-orange-400'
                                }`}>
                                <div className="flex items-center justify-center pt-4">
                                    {position === 1 ? <Crown className="w-8 h-8 text-white" /> :
                                        position === 2 ? <Medal className="w-7 h-7 text-white" /> :
                                            <Award className="w-6 h-6 text-white" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Full Leaderboard */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-semibold text-slate-800">Full Rankings</h3>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {leaderboard.map((user, index) => (
                        <div
                            key={user.id}
                            className={`flex items-center justify-between px-6 py-4 transition-colors border ${getRankBg(index + 1)}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 flex justify-center">
                                    {getRankIcon(index + 1)}
                                </div>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white ${index < 3
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                    }`}>
                                    {user.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{user.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="secondary" size="sm">{user.team}</Badge>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Flame className="w-3 h-3 text-orange-400" />
                                            {user.streak} day streak
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-amber-500 flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-amber-400" />
                                        {user.points}
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase">Points</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-700">{user.tasks}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">Tasks</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default LeaderboardPage;
