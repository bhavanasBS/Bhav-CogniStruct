import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Sparkles, CheckSquare, Clock, Target,
    Flame, Trophy, TrendingUp, ArrowUpRight, Loader2, Star
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { taskApi } from '../../api/taskApi';
import { workLogApi } from '../../api/workLogApi';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Employee', userId: 1 };
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedToday: 0,
        inProgress: 0,
        hoursToday: 0,
        streak: 7, // Mock streak for now
    });
    const [myTasks, setMyTasks] = useState([]);
    const [dailyGoals, setDailyGoals] = useState([
        { id: 1, title: 'Complete 3 tasks', done: false },
        { id: 2, title: 'Log 4 hours', done: false },
        { id: 3, title: 'Help a teammate', done: false },
    ]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const tasksRes = await taskApi.getAll({ assigneeId: user.userId });
            const tasks = tasksRes.data?.items || tasksRes.data || [];

            const myAssigned = tasks.filter(t => t.assigneeId === user.userId || t.assigneeName?.includes(user.firstName));
            const completed = myAssigned.filter(t => t.status === 2 || t.status === 3);
            const inProgress = myAssigned.filter(t => t.status === 1);

            setMyTasks(myAssigned.slice(0, 5));
            setStats(prev => ({
                ...prev,
                totalTasks: myAssigned.length,
                completedToday: completed.length,
                inProgress: inProgress.length,
            }));

            // Try to fetch today's work logs
            try {
                const logsRes = await workLogApi.getByEmployee(user.userId, {});
                const logs = logsRes.data?.items || logsRes.data || [];
                const todayLogs = logs.filter(l => {
                    const logDate = new Date(l.logDate || l.createdDate);
                    const today = new Date();
                    return logDate.toDateString() === today.toDateString();
                });
                const hoursToday = todayLogs.reduce((sum, l) => sum + (l.totalHours || 0), 0);
                setStats(prev => ({ ...prev, hoursToday: Math.round(hoursToday * 10) / 10 }));
            } catch (e) {
                console.log('Could not fetch work logs');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-slate-100 text-slate-600';
            case 1: return 'bg-blue-100 text-blue-700';
            case 2: return 'bg-emerald-100 text-emerald-700';
            case 3: return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'In Progress';
            case 2: return 'Completed';
            case 3: return 'Completed';
            default: return 'Unknown';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <LayoutDashboard className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.firstName}!
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Here's your productivity snapshot for today</p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Flame className="w-6 h-6 text-orange-300" />
                        <div>
                            <p className="text-2xl font-bold">{stats.streak}</p>
                            <p className="text-white/70 text-xs">Day Streak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalTasks}</p>
                            <p className="text-xs text-slate-500">My Tasks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.completedToday}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
                            <p className="text-xs text-slate-500">In Progress</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.hoursToday}h</p>
                            <p className="text-xs text-slate-500">Logged Today</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My Tasks */}
                <Card className="col-span-2">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <CheckSquare className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">My Tasks</h3>
                        </div>
                        <button
                            onClick={() => navigate('/employee/tasks')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                            View All <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {myTasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No tasks assigned yet</p>
                            </div>
                        ) : (
                            myTasks.map((task) => (
                                <div
                                    key={task.id || task.taskId}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/tasks/${task.id || task.taskId}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 3 ? 'bg-red-600' :
                                            task.priority === 2 ? 'bg-rose-500' :
                                                task.priority === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium text-slate-800">{task.title}</p>
                                            <p className="text-xs text-slate-400">{task.teamName || 'Personal'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-xs text-slate-400">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Daily Goals */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Target className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Today's Goals</h3>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {dailyGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${goal.done
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                                onClick={() => setDailyGoals(prev =>
                                    prev.map(g => g.id === goal.id ? { ...g, done: !g.done } : g)
                                )}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${goal.done
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-300'
                                    }`}>
                                    {goal.done && <Star className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm ${goal.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                                    {goal.title}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 pb-4">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                style={{ width: `${(dailyGoals.filter(g => g.done).length / dailyGoals.length) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            {dailyGoals.filter(g => g.done).length} of {dailyGoals.length} goals completed
                        </p>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


                <button
                    onClick={() => navigate('/time-logs')}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4 cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <Clock className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800">Log Time</p>
                        <p className="text-slate-400 text-sm">Record work hours</p>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/employee/tasks')}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-4 cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                        <CheckSquare className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800">View All Tasks</p>
                        <p className="text-slate-400 text-sm">Manage your assignments</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
