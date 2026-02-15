import { useState, useEffect } from 'react';
import {
    FileText, Sparkles, Filter, Search, Calendar,
    User, Activity, Shield, Clock, ChevronDown, Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';

const AuditLogPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [dateRange, setDateRange] = useState('week');

    // Mock audit log data
    const mockLogs = [
        { id: 1, user: 'Admin User', action: 'CREATE', resource: 'Task', description: 'Created task "Design new dashboard"', timestamp: '2026-02-09T10:30:00', ip: '192.168.1.1' },
        { id: 2, user: 'Priya Sharma', action: 'UPDATE', resource: 'User', description: 'Updated profile settings', timestamp: '2026-02-09T10:25:00', ip: '192.168.1.45' },
        { id: 3, user: 'Rahul Kumar', action: 'LOGIN', resource: 'Auth', description: 'User logged in successfully', timestamp: '2026-02-09T10:20:00', ip: '192.168.1.32' },
        { id: 4, user: 'Admin User', action: 'DELETE', resource: 'Task', description: 'Deleted task "Old project task"', timestamp: '2026-02-09T10:15:00', ip: '192.168.1.1' },
        { id: 5, user: 'Ananya Patel', action: 'UPDATE', resource: 'Team', description: 'Added member to Frontend team', timestamp: '2026-02-09T10:10:00', ip: '192.168.1.78' },
        { id: 6, user: 'Admin User', action: 'CREATE', resource: 'User', description: 'Created new user "Vikram Singh"', timestamp: '2026-02-09T09:55:00', ip: '192.168.1.1' },
        { id: 7, user: 'System', action: 'SYSTEM', resource: 'Backup', description: 'Automated backup completed', timestamp: '2026-02-09T09:00:00', ip: 'localhost' },
        { id: 8, user: 'Sneha Reddy', action: 'LOGOUT', resource: 'Auth', description: 'User logged out', timestamp: '2026-02-08T18:45:00', ip: '192.168.1.56' },
        { id: 9, user: 'Admin User', action: 'UPDATE', resource: 'Role', description: 'Modified permissions for Manager role', timestamp: '2026-02-08T16:30:00', ip: '192.168.1.1' },
        { id: 10, user: 'Arjun Nair', action: 'CREATE', resource: 'WorkLog', description: 'Logged 4 hours on task', timestamp: '2026-02-08T15:20:00', ip: '192.168.1.89' },
    ];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                // In real app, fetch from API
                await new Promise(r => setTimeout(r, 500));
                setLogs(mockLogs);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
                toast.error('Failed to load audit logs');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [dateRange]);

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'LOGIN': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'LOGOUT': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'SYSTEM': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getResourceIcon = (resource) => {
        switch (resource) {
            case 'Task': return <FileText className="w-4 h-4" />;
            case 'User': return <User className="w-4 h-4" />;
            case 'Auth': return <Shield className="w-4 h-4" />;
            case 'Team': return <Activity className="w-4 h-4" />;
            case 'Role': return <Shield className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    const actionTypes = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYSTEM'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Audit Log
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/70 text-sm mt-0.5">Track all system activities</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                            <p className="text-2xl font-bold">{logs.length}</p>
                            <p className="text-white/60 text-xs">Total Events</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-white/10 rounded-lg">
                            <p className="text-2xl font-bold">{logs.filter(l => l.action === 'CREATE').length}</p>
                            <p className="text-white/60 text-xs">Creates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] max-w-md">
                    <SearchBar
                        placeholder="Search logs..."
                        onSearch={setSearch}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {actionTypes.map((action) => (
                        <button
                            key={action}
                            onClick={() => setActionFilter(action)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${actionFilter === action
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {action === 'all' ? 'All' : action}
                        </button>
                    ))}
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            {/* Log Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Timestamp</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">User</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Action</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Resource</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Description</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(log.timestamp).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-800">{log.user}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                {getResourceIcon(log.resource)}
                                                {log.resource}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600">{log.description}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">{log.ip}</code>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogPage;
