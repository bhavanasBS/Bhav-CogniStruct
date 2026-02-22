import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, ClipboardList, Sparkles, CheckCircle, Clock, AlertTriangle, Target } from 'lucide-react';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import TaskList from '../../components/tasks/TaskList';
import TaskCard from '../../components/tasks/TaskCard';
import TaskForm from '../../components/tasks/TaskForm';
import TaskFilters from '../../components/tasks/TaskFilters';
import Pagination from '../../components/common/Pagination';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../api/taskApi';
import { teamApi } from '../../api/teamApi';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: null, priority: null, dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Real employees and teams for task form
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        pageSize: 10,
        search: search || undefined,
        status: filters.status ?? undefined,
        priority: filters.priority ?? undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const response = await taskApi.getAll(params);
      setTasks(response.data.items || response.data || []);
      setTotalCount(response.data.totalCount || response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesAndTeams = async () => {
    try {
      const empRes = await userApi.getMyEmployees();
      setEmployees((empRes.data || []).map(u => ({
        userId: u.id || u.userId,
        firstName: u.firstName,
        lastName: u.lastName,
      })));
    } catch {
      try {
        const teamRes = await teamApi.getMyTeam();
        const myTeams = teamRes.data || [];
        if (myTeams.length > 0) {
          const tid = myTeams[0].id || myTeams[0].teamId;
          const membersRes = await teamApi.getMembers(tid);
          setEmployees((membersRes.data || []).map(m => ({
            userId: m.userId,
            firstName: m.name?.split(' ')[0] || '',
            lastName: m.name?.split(' ').slice(1).join(' ') || '',
          })));
        }
      } catch { /* no employees */ }
    }
    try {
      const teamRes = await teamApi.getAll();
      setTeams((teamRes.data.items || teamRes.data || []).map(t => ({
        teamId: t.id || t.teamId,
        teamName: t.teamName,
      })));
    } catch {
      try {
        const teamRes = await teamApi.getMyTeam();
        setTeams((teamRes.data || []).map(t => ({
          teamId: t.id || t.teamId,
          teamName: t.teamName,
        })));
      } catch { /* no teams */ }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, filters]);

  useEffect(() => {
    fetchEmployeesAndTeams();
  }, []);

  const handleCreateTask = async (data) => {
    try {
      await taskApi.create({
        title: data.title,
        description: data.description,
        assigneeId: Number(data.assignedTo) || null,
        teamId: Number(data.teamId) || null,
        priority: data.priority,
        deadline: data.deadline || null,
        estimatedHours: data.estimatedHours,
      });
      toast.success('Task created successfully');
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  // Calculate stats from fetched tasks
  const pendingCount = tasks.filter(t => t.status === 0).length;
  const inProgressCount = tasks.filter(t => t.status === 1).length;
  const completedCount = tasks.filter(t => t.status === 2).length;
  const overdueCount = tasks.filter(t => t.status === 3).length;

  return (
    <div className="space-y-6">
      {/* Header with Cognitive Styling */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Task Management
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Manage, track, and organize all your task assignments</p>
            </div>
          </div>
          <Button
            icon={Plus}
            onClick={() => setShowForm(true)}
            className="!bg-white !text-indigo-600 hover:!bg-white/90"
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{inProgressCount}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{overdueCount}</p>
              <p className="text-xs text-slate-500">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + View Toggle */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Search tasks..." onSearch={setSearch} className="flex-1 max-w-md" />
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
            <ClipboardList className="h-4 w-4" />
            {totalCount} tasks
          </div>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFilterChange={(key, val) => setFilters((p) => ({ ...p, [key]: val }))}
        onReset={() => setFilters({ status: null, priority: null, dateFrom: '', dateTo: '' })}
      />

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {viewMode === 'list' ? (
          <TaskList tasks={tasks} isLoading={isLoading} onSelect={(t) => navigate(`/tasks/${t.id || t.taskId}`)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))
            ) : (
              tasks.map((task) => <TaskCard key={task.id || task.taskId} task={task} onClick={(t) => navigate(`/tasks/${t.id || t.taskId}`)} />)
            )}
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={Math.ceil(totalCount / 10)} totalCount={totalCount} pageSize={10} onPageChange={setPage} />

      <TaskForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateTask}
        employees={employees}
        teams={teams}
      />
    </div>
  );
};

export default TasksPage;
