import { useState, useEffect } from 'react';
import {
    CheckSquare, Sparkles, Filter, Search, Clock,
    AlertCircle, CheckCircle, Loader2, ArrowUpRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { taskApi } from '../../api/taskApi';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyTasksPage = () => {
    const authCtx = useAuthContext();
    const user = authCtx?.user || { firstName: 'Employee', userId: 1 };
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const res = await taskApi.getAll({ assigneeId: user.userId });
            const allTasks = res.data?.items || res.data || [];
            // Filter for my tasks
            const myTasks = allTasks.filter(t =>
                t.assigneeId === user.userId ||
                t.assigneeName?.toLowerCase().includes(user.firstName?.toLowerCase())
            );
            setTasks(myTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await taskApi.update(taskId, { status: newStatus });
            toast.success('Task updated!');
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
            toast.error('Failed to update task');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-slate-100 text-slate-600 border-slate-200';
            case 1: return 'bg-blue-100 text-blue-700 border-blue-200';
            case 2: case 3: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return 'Pending';
            case 1: return 'In Progress';
            case 2: case 3: return 'Completed';
            default: return 'Unknown';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 2: return 'bg-rose-500';
            case 1: return 'bg-amber-500';
            default: return 'bg-emerald-500';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 2: return 'High';
            case 1: return 'Medium';
            default: return 'Low';
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && task.status === 0) ||
            (statusFilter === 'progress' && task.status === 1) ||
            (statusFilter === 'completed' && (task.status === 2 || task.status === 3));
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 0).length,
        inProgress: tasks.filter(t => t.status === 1).length,
        completed: tasks.filter(t => t.status === 2 || t.status === 3).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <CheckSquare className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                My Tasks
                                <Sparkles className="w-5 h-5 text-amber-300" />
                            </h1>
                            <p className="text-white/80 text-sm mt-0.5">Manage your assigned tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-white/70 text-xs">Total</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{stats.inProgress}</p>
                            <p className="text-white/70 text-xs">Active</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-white/20 rounded-lg">
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-white/70 text-xs">Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                    <SearchBar
                        placeholder="Search tasks..."
                        onSearch={setSearch}
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'progress', label: 'In Progress' },
                        { key: 'completed', label: 'Completed' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === f.key
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            <Card>
                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No tasks found</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task.taskId}
                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Priority indicator */}
                                    <div className={`w-2 h-10 rounded-full ${getPriorityColor(task.priority)}`} />

                                    {/* Status checkbox */}
                                    <button
                                        onClick={() => {
                                            if (task.status === 0) updateTaskStatus(task.taskId, 1);
                                            else if (task.status === 1) updateTaskStatus(task.taskId, 2);
                                        }}
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${task.status === 2 || task.status === 3
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : task.status === 1
                                                    ? 'border-blue-400 bg-blue-50'
                                                    : 'border-slate-300 hover:border-indigo-400'
                                            }`}
                                    >
                                        {(task.status === 2 || task.status === 3) && (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        )}
                                    </button>

                                    {/* Task info */}
                                    <div className="flex-1">
                                        <p className={`font-medium ${task.status === 2 || task.status === 3
                                                ? 'text-slate-400 line-through'
                                                : 'text-slate-800'
                                            }`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400">{task.teamName || 'Personal'}</span>
                                            {task.dueDate && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className={`text-xs flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 2
                                                            ? 'text-rose-500'
                                                            : 'text-slate-400'
                                                        }`}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge variant={task.priority === 2 ? 'danger' : task.priority === 1 ? 'warning' : 'success'} size="sm">
                                        {getPriorityLabel(task.priority)}
                                    </Badge>
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(task.status)}`}>
                                        {getStatusLabel(task.status)}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/tasks/${task.taskId}`)}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all cursor-pointer"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MyTasksPage;
