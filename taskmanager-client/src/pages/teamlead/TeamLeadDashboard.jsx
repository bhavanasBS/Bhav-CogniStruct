import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, ClipboardList, CheckCircle, Clock,
    TrendingUp, AlertCircle, ArrowUpRight, BarChart3, Target, Loader2, Star, Calendar
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { managerApi } from '../../api/managerApi';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TeamLeadDashboard = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { userId: 1, firstName: 'Team Lead' };
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            // TeamLeads are linked via TeamMembers, not Teams.ManagerId
            const response = await managerApi.getTeamLeadDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error('Failed to fetch teamlead dashboard data:', error);
            try {
                // Fallback to manager dashboard (for users with dual roles)
                const response = await managerApi.getMyDashboard();
                setDashboard(response.data);
            } catch (e) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'on-track': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'at-risk': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'behind': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'on-track': return 'On Track';
            case 'at-risk': return 'At Risk';
            case 'behind': return 'Behind';
            default: return 'Unknown';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    const stats = dashboard || { totalTeams: 0, activeTasks: 0, totalHours: 0, avgEfficiency: 0, teamReports: [] };
    const teamReports = stats.teamReports || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Star className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {user.firstName}
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Your team's progress at a glance — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                            <Calendar className="w-4 h-4 text-white/70" />
                            <span className="text-sm font-medium text-white/90">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate('/teamlead/team')}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
                        >
                            <Users className="w-4 h-4" />
                            View My Team
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalTeams}</p>
                            <p className="text-xs text-slate-500">My Teams</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.activeTasks}</p>
                            <p className="text-xs text-slate-500">Active Tasks</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalHours}h</p>
                            <p className="text-xs text-slate-500">Hours Logged</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats.avgEfficiency}%</p>
                            <p className="text-xs text-slate-500">Team Efficiency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Team Progress</h3>
                            </div>
                            <Badge variant="warning">{teamReports.length} Teams</Badge>
                        </div>
                    </div>
                    <div className="p-4">
                        {teamReports.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No teams assigned yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {teamReports.map((team) => (
                                    <div
                                        key={team.id}
                                        className="bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-slate-100 hover:border-amber-200"
                                        onClick={() => navigate(`/teams/${team.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{team.name}</h4>
                                                <p className="text-xs text-slate-400">{team.lead}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(team.status)}`}>
                                                {getStatusLabel(team.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                            <div className="bg-white rounded-lg p-2 text-center">
                                                <p className="text-lg font-bold text-slate-800">{team.members}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Members</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-2 text-center">
                                                <p className="text-lg font-bold text-slate-800">{team.activeTasks}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Active Tasks</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span className="font-medium">{team.completedTasks} completed</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{team.totalHours}h</span>
                                            </div>
                                        </div>

                                        {/* Efficiency Bar */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-slate-500">Efficiency</span>
                                                <span className="font-semibold text-slate-700">{team.efficiency}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${team.efficiency >= 70 ? 'bg-emerald-500' :
                                                        team.efficiency >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${team.efficiency}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/teamlead/tasks')}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                        <ClipboardList className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800">Manage Tasks</p>
                        <p className="text-xs text-slate-400">Assign and track tasks</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-amber-500 transition-colors" />
                </button>
                <button
                    onClick={() => navigate('/teamlead/team')}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <Users className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800">My Team</p>
                        <p className="text-xs text-slate-400">View team members</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
                </button>
                <button
                    onClick={() => navigate('/teamlead/time-logs')}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-amber-200 transition-all flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                        <Clock className="w-5 h-5 text-rose-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-slate-800">Time Logs</p>
                        <p className="text-xs text-slate-400">Track team hours</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-rose-500 transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
