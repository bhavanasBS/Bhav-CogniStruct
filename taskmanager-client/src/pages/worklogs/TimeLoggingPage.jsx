import { useState, useEffect } from 'react';
import { Clock, Plus, Sparkles, Calendar, Timer, CheckCircle, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { workLogApi } from '../../api/workLogApi';
import { taskApi } from '../../api/taskApi';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TimeLoggingPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tasks, setTasks] = useState([]);

    // Form state
    const [form, setForm] = useState({
        taskId: '',
        hours: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
    });

    // Get user from AuthContext (primary) or localStorage fallback
    const authCtx = useAuthContext();
    const authUser = authCtx?.user || JSON.parse(localStorage.getItem('auth_user') || '{}');
    const userId = authUser.userId || authUser.id;

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await workLogApi.getByEmployee(userId, {});
            setLogs(response.data.items || response.data || []);
        } catch (error) {
            console.error('Failed to fetch time logs:', error);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await taskApi.getAll({ pageSize: 100 });
            setTasks(response.data.items || response.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchLogs();
            fetchTasks();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.taskId || !form.hours) {
            toast.error('Please select a task and enter hours');
            return;
        }

        try {
            setIsSubmitting(true);
            const startTime = new Date(form.date);
            startTime.setHours(9, 0, 0, 0);
            const totalHours = parseFloat(form.hours);
            const endTime = new Date(startTime.getTime() + totalHours * 60 * 60 * 1000);

            await workLogApi.create({
                taskId: Number(form.taskId),
                userId: userId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                totalHours: totalHours,
                description: form.description,
            });
            toast.success('Time logged successfully!');
            setShowForm(false);
            setForm({ taskId: '', hours: '', description: '', date: new Date().toISOString().slice(0, 10) });
            fetchLogs();
        } catch (error) {
            console.error('Failed to log time:', error);
            toast.error(error.response?.data?.message || 'Failed to log time');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalHours = logs.reduce((acc, l) => acc + (l.totalHours || l.hoursLogged || l.hours || 0), 0);
    const todayLogs = logs.filter(l => {
        const logDate = new Date(l.startTime || l.logDate || l.date).toDateString();
        return logDate === new Date().toDateString();
    });
    const todayHours = todayLogs.reduce((acc, l) => acc + (l.totalHours || l.hoursLogged || l.hours || 0), 0);

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
                            <Clock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Time Logging
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Track and manage time spent on tasks</p>
                        </div>
                    </div>
                    <Button
                        className="!bg-white !text-amber-600 hover:!bg-white/90"
                        icon={Plus}
                        onClick={() => setShowForm(true)}
                    >
                        Log Time
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
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
                            <p className="text-xs text-slate-500">Entries</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Logs Table */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Recent Time Logs</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hours</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No time logs found</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id || log.workLogId} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.taskTitle || log.task || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{log.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                                                {log.totalHours || log.hoursLogged || log.hours || 0}h
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(log.startTime || log.logDate || log.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Log Time Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Log Time</h2>
                                    <p className="text-white/80 text-xs">Record time spent on a task</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Task *</label>
                                <select
                                    value={form.taskId}
                                    onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                                    required
                                >
                                    <option value="">Select a task</option>
                                    {tasks.map(t => (
                                        <option key={t.id || t.taskId} value={t.id || t.taskId}>
                                            {t.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hours *</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="24"
                                        value={form.hours}
                                        onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="e.g. 2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                    placeholder="What did you work on?"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmitting ? 'Logging...' : 'Log Time'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeLoggingPage;
