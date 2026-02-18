import { useState, useEffect } from 'react';
import {
    Clock, Sparkles, Calendar, Timer, CheckCircle, Users,
    Loader2, Search, ChevronDown
} from 'lucide-react';
import Card from '../../components/common/Card';
import { workLogApi } from '../../api/workLogApi';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const HRTimeLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [empRes] = await Promise.all([
                    userApi.getAll(),
                ]);
                const emps = empRes.data || [];
                setEmployees(emps);

                // Try fetching all work logs
                try {
                    const logRes = await workLogApi.getAll ? await workLogApi.getAll({}) : { data: [] };
                    setLogs(logRes.data?.items || logRes.data || []);
                } catch {
                    // If getAll doesn't exist, try fetching logs for each employee
                    const allLogs = [];
                    for (const emp of emps.slice(0, 20)) {
                        try {
                            const res = await workLogApi.getByEmployee(emp.userId || emp.id, {});
                            const empLogs = res.data?.items || res.data || [];
                            empLogs.forEach(l => {
                                l._employeeName = `${emp.firstName} ${emp.lastName}`;
                                l._employeeEmail = emp.email;
                            });
                            allLogs.push(...empLogs);
                        } catch {
                            // Skip if employee logs can't be fetched
                        }
                    }
                    setLogs(allLogs);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load time logs');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalHours = logs.reduce((acc, l) => acc + (l.hoursLogged || l.hours || 0), 0);
    const todayLogs = logs.filter(l => {
        const logDate = new Date(l.logDate || l.date).toDateString();
        return logDate === new Date().toDateString();
    });
    const todayHours = todayLogs.reduce((acc, l) => acc + (l.hoursLogged || l.hours || 0), 0);

    const filteredLogs = logs.filter(l => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (l._employeeName || '').toLowerCase().includes(q) ||
            (l.taskTitle || l.task || '').toLowerCase().includes(q) ||
            (l.description || '').toLowerCase().includes(q);
    });

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
                        <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Employee Time Logs
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                        </h1>
                        <p className="text-white/80 text-sm mt-0.5">Monitor and review time tracked by all employees</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                            <Timer className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalHours.toFixed(1)}h</p>
                            <p className="text-xs text-slate-500">Total Hours</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{todayHours.toFixed(1)}h</p>
                            <p className="text-xs text-slate-500">Today</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
                            <p className="text-xs text-slate-500">Total Entries</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
                            <p className="text-xs text-slate-500">Employees</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by employee, task, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        {filteredLogs.length} entries
                    </div>
                </div>
            </div>

            {/* Time Logs Table */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">All Time Logs</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>No time logs found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <tr key={log.workLogId || log.id || idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {(log._employeeName || log.employeeName || 'U')[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">
                                                    {log._employeeName || log.employeeName || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                            {log.taskTitle || log.task || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {log.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                                                {log.hoursLogged || log.hours || 0}h
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.logDate || log.date).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
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

export default HRTimeLogsPage;
