import { useState, useEffect } from 'react';
import {
    Building2, Sparkles, Users, UserPlus, Briefcase,
    FileText, Clock, BarChart3, Loader2, Calendar, UserCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const HRDashboard = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'HR', userId: 1 };

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        newHires: 0,
        pendingRequests: 0,
        onLeave: 0,
    });
    const [recentHires, setRecentHires] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch users for employee count
                const res = await userApi.getAll();
                const users = res.data?.items || res.data || [];

                setStats({
                    totalEmployees: users.length,
                    newHires: Math.min(users.length, 5),
                    pendingRequests: 3,
                    onLeave: 2,
                });

                // Mock recent hires
                setRecentHires(users.slice(0, 5).map(u => ({
                    id: u.userId,
                    name: `${u.firstName} ${u.lastName}`,
                    role: u.roleName || 'Employee',
                    joinDate: new Date().toISOString(),
                    department: u.teamName || 'General',
                })));

                // Mock leave requests
                setLeaveRequests([
                    { id: 1, name: 'Priya Sharma', type: 'Sick Leave', days: 2, status: 'pending' },
                    { id: 2, name: 'Rahul Kumar', type: 'Vacation', days: 5, status: 'pending' },
                    { id: 3, name: 'Ananya Patel', type: 'Personal', days: 1, status: 'approved' },
                ]);
            } catch (error) {
                console.error('Failed to fetch HR data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
        { label: 'New Hires (30d)', value: stats.newHires, icon: UserPlus, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Requests', value: stats.pendingRequests, icon: FileText, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
        { label: 'On Leave Today', value: stats.onLeave, icon: Calendar, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
    ];

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
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                HR Dashboard
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Welcome back, {user.firstName}!</p>
                        </div>
                    </div>
                    <Button variant="secondary" icon={UserPlus}>
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className={`${stat.bg} border-0`}>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Recent Hires */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-semibold text-slate-800">Recent Hires</h3>
                        </div>
                        <Badge variant="success">{recentHires.length} new</Badge>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : recentHires.length === 0 ? (
                            <div className="p-6 text-center text-slate-400">No recent hires</div>
                        ) : (
                            recentHires.map((hire) => (
                                <div key={hire.id} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {hire.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{hire.name}</p>
                                            <p className="text-xs text-slate-400">{hire.role} • {hire.department}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(hire.joinDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Leave Requests */}
                <Card>
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-500" />
                            <h3 className="font-semibold text-slate-800">Leave Requests</h3>
                        </div>
                        <Badge variant="warning">{leaveRequests.filter(l => l.status === 'pending').length} pending</Badge>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {leaveRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${request.status === 'pending' ? 'bg-amber-100' : 'bg-emerald-100'
                                        }`}>
                                        <Calendar className={`w-5 h-5 ${request.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{request.name}</p>
                                        <p className="text-xs text-slate-400">{request.type} • {request.days} days</p>
                                    </div>
                                </div>
                                {request.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                                            Approve
                                        </button>
                                        <button className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer">
                                            Decline
                                        </button>
                                    </div>
                                ) : (
                                    <Badge variant="success" size="sm">Approved</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Quick Actions</h3>
                </div>
                <div className="p-6 grid grid-cols-4 gap-4">
                    {[
                        { label: 'Add Employee', icon: UserPlus, color: 'from-emerald-500 to-emerald-600' },
                        { label: 'View Directory', icon: Users, color: 'from-blue-500 to-blue-600' },
                        { label: 'Attendance', icon: UserCheck, color: 'from-violet-500 to-violet-600' },
                        { label: 'Reports', icon: BarChart3, color: 'from-amber-500 to-amber-600' },
                    ].map((action, i) => (
                        <button
                            key={i}
                            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{action.label}</span>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default HRDashboard;
