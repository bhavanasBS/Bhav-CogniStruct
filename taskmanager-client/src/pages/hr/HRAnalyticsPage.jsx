import { useState, useEffect } from 'react';
import {
    BarChart3, Users, UserCheck, UserX, Clock, TrendingUp,
    Briefcase, Award, Sparkles, ArrowUpRight, ArrowDownRight,
    Loader2, Shield
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const HRAnalyticsPage = () => {
    const [period, setPeriod] = useState('month');
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await userApi.getAll();
                setEmployees(res.data || []);
            } catch (err) {
                console.error('Failed to fetch employee data:', err);
                toast.error('Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalEmployees = employees.length;
    const activeCount = employees.filter(e => e.isActive !== false).length;
    const inactiveCount = employees.filter(e => e.isActive === false).length;
    const allRoles = employees.flatMap(e => e.roles || []);
    const roleCounts = allRoles.reduce((acc, role) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const roleColors = {
        'Admin': { bg: 'from-red-500 to-red-600', bar: 'bg-red-500' },
        'Manager': { bg: 'from-blue-500 to-blue-600', bar: 'bg-blue-500' },
        'TeamLead': { bg: 'from-amber-500 to-amber-600', bar: 'bg-amber-500' },
        'Team Lead': { bg: 'from-amber-500 to-amber-600', bar: 'bg-amber-500' },
        'HR': { bg: 'from-pink-500 to-pink-600', bar: 'bg-pink-500' },
        'Employee': { bg: 'from-emerald-500 to-emerald-600', bar: 'bg-emerald-500' },
    };

    const kpis = [
        { label: 'Total Employees', value: totalEmployees, icon: Users, gradient: 'from-pink-500 to-rose-600' },
        { label: 'Active', value: activeCount, icon: UserCheck, gradient: 'from-emerald-500 to-emerald-600' },
        { label: 'Inactive', value: inactiveCount, icon: UserX, gradient: 'from-slate-400 to-slate-500' },
        { label: 'Roles Defined', value: Object.keys(roleCounts).length, icon: Shield, gradient: 'from-violet-500 to-violet-600' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

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
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                HR Analytics
                                <Sparkles className="w-5 h-5 text-yellow-200" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Workforce insights and employee metrics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                        {['week', 'month', 'quarter'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${period === p ? 'bg-white text-rose-600 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                                <p className="text-xs text-slate-500">{kpi.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle>Role Distribution</CardTitle>
                        </div>
                    </CardHeader>
                    <div className="p-6 space-y-4">
                        {Object.entries(roleCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([role, count]) => {
                                const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                                const colors = roleColors[role] || { bar: 'bg-slate-500' };
                                return (
                                    <div key={role}>
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <span className="font-medium text-slate-700">{role}</span>
                                            <span className="text-slate-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${colors.bar}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        {Object.keys(roleCounts).length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p>No role data available</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Workforce Overview */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle>Workforce Status</CardTitle>
                        </div>
                    </CardHeader>
                    <div className="p-6">
                        {/* Active vs Inactive visual */}
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex-1">
                                <div className="relative w-40 h-40 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                                        <circle
                                            cx="50" cy="50" r="40" fill="none"
                                            stroke="url(#activeGrad)" strokeWidth="12"
                                            strokeDasharray={`${totalEmployees > 0 ? (activeCount / totalEmployees) * 251.2 : 0} 251.2`}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#059669" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-800">
                                            {totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}%
                                        </span>
                                        <span className="text-xs text-slate-400">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                                <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
                                <p className="text-xs text-emerald-500 mt-1">Active Employees</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                                <p className="text-2xl font-bold text-slate-600">{inactiveCount}</p>
                                <p className="text-xs text-slate-400 mt-1">Inactive Employees</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle>Employee Roster</CardTitle>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.slice(0, 10).map((emp) => (
                                <tr key={emp.userId || emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                                                {(emp.firstName?.[0] || '').toUpperCase()}{(emp.lastName?.[0] || '').toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-800">{emp.firstName} {emp.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{emp.email}</td>
                                    <td className="px-6 py-4">
                                        {(emp.roles || []).map((role, i) => {
                                            const colors = roleColors[role] || { bar: 'bg-slate-500' };
                                            const badgeColors = {
                                                'Admin': 'bg-red-100 text-red-700',
                                                'Manager': 'bg-blue-100 text-blue-700',
                                                'TeamLead': 'bg-amber-100 text-amber-700',
                                                'Team Lead': 'bg-amber-100 text-amber-700',
                                                'HR': 'bg-pink-100 text-pink-700',
                                                'Employee': 'bg-emerald-100 text-emerald-700',
                                            };
                                            return (
                                                <span key={i} className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium mr-1 ${badgeColors[role] || 'bg-slate-100 text-slate-600'}`}>
                                                    {role}
                                                </span>
                                            );
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${emp.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            <span className={`text-xs font-medium ${emp.isActive !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {emp.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default HRAnalyticsPage;
