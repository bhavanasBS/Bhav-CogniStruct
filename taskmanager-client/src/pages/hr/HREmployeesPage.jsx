import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Mail, Phone, Building2, Shield,
    Loader2, Sparkles, UserCheck, UserX, ChevronDown
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const HREmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getAll();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            toast.error('Failed to load employee data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = !searchQuery ||
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'All' ||
            (emp.roles && emp.roles.some(r => r === roleFilter));

        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && emp.isActive !== false) ||
            (statusFilter === 'Inactive' && emp.isActive === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const allRoles = [...new Set(employees.flatMap(e => e.roles || []))];
    const activeCount = employees.filter(e => e.isActive !== false).length;
    const inactiveCount = employees.filter(e => e.isActive === false).length;

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin': return 'bg-red-100 text-red-700 border-red-200';
            case 'Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'TeamLead':
            case 'Team Lead': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'HR': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'Employee': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

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
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Employee Directory
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">View and monitor all employees across the organization</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
                            <p className="text-xs text-slate-500">Total Employees</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
                            <UserX className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{inactiveCount}</p>
                            <p className="text-xs text-slate-500">Inactive</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 bg-white cursor-pointer"
                        >
                            <option value="All">All Roles</option>
                            {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 bg-white cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{filteredEmployees.length}</span> employees
                    </div>
                </div>
            </div>

            {/* Employee List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Employee Directory</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No employees found</p>
                        </div>
                    ) : (
                        filteredEmployees.map((emp) => (
                            <div
                                key={emp.userId || emp.id}
                                className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {(emp.firstName?.[0] || '').toUpperCase()}{(emp.lastName?.[0] || '').toUpperCase()}
                                </div>

                                {/* Name & Email */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {emp.firstName} {emp.lastName}
                                    </p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {emp.email}
                                    </p>
                                </div>

                                {/* Role Badges */}
                                <div className="flex gap-1.5">
                                    {(emp.roles || []).map((role, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(role)}`}
                                        >
                                            {role}
                                        </span>
                                    ))}
                                    {(!emp.roles || emp.roles.length === 0) && (
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-100 text-slate-500 border-slate-200">
                                            No Role
                                        </span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-1.5 min-w-[80px]">
                                    <div className={`w-2 h-2 rounded-full ${emp.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className={`text-xs font-medium ${emp.isActive !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {emp.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Join Date */}
                                <div className="text-xs text-slate-400 min-w-[90px] text-right">
                                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : '—'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HREmployeesPage;
