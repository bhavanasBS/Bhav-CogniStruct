import { useState, useEffect } from 'react';
import { Clock, Calendar, Timer, CheckCircle, Users, User } from 'lucide-react';
import Card from '../../components/common/Card';
import { workLogApi } from '../../api/workLogApi';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ManagerTimeLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const authCtx = useAuthContext();
    const user = authCtx?.user;

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            if (!user?.id && !user?.userId) {
                setLogs([]);
                return;
            }
            const managerId = user.id || user.userId;
            const response = await workLogApi.getByTeam(managerId);
            setLogs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch team time logs:', error);
            toast.error('Failed to load team time logs');
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const totalHours = logs.reduce((acc, l) => acc + (l.totalHours || l.hoursLogged || l.hours || 0), 0);
    const todayLogs = logs.filter(l => {
        const logDate = new Date(l.startTime || l.logDate || l.date).toDateString();
        return logDate === new Date().toDateString();
    });
    const todayHours = todayLogs.reduce((acc, l) => acc + (l.totalHours || l.hoursLogged || l.hours || 0), 0);
    const uniqueMembers = [...new Set(logs.map(l => l.userId))].length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Team Time Logs
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">View and manage your team's logged hours</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Timer className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{totalHours.toFixed(1)}h</p>
                            <p className="text-xs text-slate-500">Team Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{uniqueMembers}</p>
                            <p className="text-xs text-slate-500">Team Members</p>
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
            </div>

            {/* Team Time Logs Table */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Team Time Logs</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading team logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No team time logs found</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id || log.workLogId} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">{log.userName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.taskTitle || log.task || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{log.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                {log.totalHours || log.hoursLogged || log.hours || 0}h
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.startTime || log.logDate || log.date || log.createdDate).toLocaleDateString()}
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

export default ManagerTimeLogsPage;
