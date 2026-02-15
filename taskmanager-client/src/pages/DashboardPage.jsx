import { useState, useEffect } from 'react';
import '../utils/chartSetup';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Timer,
  Target,
  Activity,
  UserCheck,
  Calendar,
  ChevronRight,
  BarChart3,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../utils/constants';
import { isAdmin, isManager, isEmployee } from '../utils/roleUtils';

/* ─── Stat Card Component ─────────────────────────── */
const StatCard = ({ title, value, change, changeType, icon: Icon, iconBg, subtitle }) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {changeType === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{change}% vs last week</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

/* ─── Task Row Component ──────────────────────────── */
const TaskRow = ({ title, status, assignee, deadline, priority }) => {
  const statusColors = TASK_STATUS_COLORS[status] || TASK_STATUS_COLORS[0];
  const priorityLabels = ['Low', 'Medium', 'High', 'Urgent'];
  const priorityColors = ['text-slate-500', 'text-blue-600', 'text-amber-600', 'text-rose-600'];

  return (
    <div className="flex items-center py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors.dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">{assignee}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">Due: {deadline}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium ${priorityColors[priority] || priorityColors[0]}`}>
          {priorityLabels[priority] || 'Low'}
        </span>
        <Badge variant={status === 2 ? 'success' : status === 3 ? 'danger' : status === 1 ? 'primary' : 'default'}>
          {TASK_STATUS_LABELS[status] || 'Pending'}
        </Badge>
      </div>
    </div>
  );
};

/* ─── Activity Item Component ─────────────────────── */
const ActivityItem = ({ action, user, time, icon: Icon, type }) => {
  const colors = {
    success: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    info: { bg: 'bg-blue-100', text: 'text-blue-600' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
    default: { bg: 'bg-slate-100', text: 'text-slate-600' },
  };
  const c = colors[type] || colors.default;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`p-2 rounded-lg ${c.bg} ${c.text} flex-shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">{user}</span> {action}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

/* ─── Team Member Card ────────────────────────────── */
const TeamMember = ({ name, role, tasks, avatar }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
      {name.split(' ').map(n => n[0]).join('')}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
      <p className="text-xs text-slate-400">{role}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-slate-800">{tasks}</p>
      <p className="text-xs text-slate-400">tasks</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'Admin', lastName: 'User', roles: ['Admin'] };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Chart data
  const weeklyChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Completed', data: [5, 7, 4, 8, 6, 2, 3], backgroundColor: '#6366f1', borderRadius: 4 },
      { label: 'Created', data: [3, 2, 5, 1, 4, 1, 2], backgroundColor: '#e0e7ff', borderRadius: 4 },
    ],
  };
  const weeklyOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 8, usePointStyle: true } } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 2 } }
    },
  };

  const statusChart = {
    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
    datasets: [{
      data: [38, 32, 18, 12],
      backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };
  const statusOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } },
  };

  const tasks = [
    { title: 'Implement user authentication module', status: 1, assignee: 'John Doe', deadline: 'Feb 12, 2026', priority: 2 },
    { title: 'Design team dashboard layout', status: 2, assignee: 'Jane Smith', deadline: 'Feb 10, 2026', priority: 1 },
    { title: 'Set up CI/CD pipeline', status: 0, assignee: 'Mike Johnson', deadline: 'Feb 15, 2026', priority: 2 },
    { title: 'Write API documentation', status: 3, assignee: 'Sarah Wilson', deadline: 'Feb 05, 2026', priority: 3 },
    { title: 'Database migration scripts', status: 1, assignee: 'Tom Brown', deadline: 'Feb 14, 2026', priority: 1 },
  ];

  const activities = [
    { action: 'completed "Dashboard Design"', user: 'Jane Smith', time: '2 hours ago', icon: CheckCircle2, type: 'success' },
    { action: 'logged 4.5 hours of work', user: 'John Doe', time: '3 hours ago', icon: Timer, type: 'info' },
    { action: 'assigned a task to Mike', user: 'Admin', time: '5 hours ago', icon: Target, type: 'default' },
    { action: 'joined the Engineering team', user: 'Sarah Khan', time: '6 hours ago', icon: UserCheck, type: 'success' },
  ];

  const teamMembers = [
    { name: 'Jane Smith', role: 'Senior Developer', tasks: 8 },
    { name: 'John Doe', role: 'Frontend Developer', tasks: 6 },
    { name: 'Mike Johnson', role: 'Backend Developer', tasks: 5 },
    { name: 'Sarah Wilson', role: 'UI/UX Designer', tasks: 4 },
  ];

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {user.firstName}</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin(user) && 'Here\'s an overview of your organization\'s performance.'}
            {isManager(user) && 'Track your team\'s progress and manage tasks.'}
            {isEmployee(user) && 'Here\'s what you need to focus on today.'}
            {!isAdmin(user) && !isManager(user) && !isEmployee(user) && 'Welcome to your dashboard.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value="128"
          subtitle="12 due today"
          change={12}
          changeType="up"
          icon={ClipboardList}
          iconBg="bg-indigo-500"
        />
        <StatCard
          title="Completed"
          value="87"
          subtitle="68% completion rate"
          change={8}
          changeType="up"
          icon={CheckCircle2}
          iconBg="bg-emerald-500"
        />
        <StatCard
          title="Hours Logged"
          value="312h"
          subtitle="This month"
          change={5}
          changeType="up"
          icon={Clock}
          iconBg="bg-amber-500"
        />
        <StatCard
          title="Team Members"
          value="24"
          subtitle="3 active teams"
          icon={Users}
          iconBg="bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Weekly Progress</h3>
                <p className="text-sm text-slate-500">Task completion overview</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-indigo-100 rounded-sm"></span> Created
                </span>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <Bar data={weeklyChart} options={weeklyOpts} />
            </div>
          </Card>

          {/* Tasks Table */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Tasks</h3>
                <p className="text-sm text-slate-500">Latest task assignments and updates</p>
              </div>
              <a href="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="-mx-6">
              <div className="px-6">
                {tasks.map((task, idx) => (
                  <TaskRow key={idx} {...task} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Task Status Distribution */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Task Distribution</h3>
              <p className="text-sm text-slate-500">By status</p>
            </div>
            <div style={{ height: 220 }}>
              <Doughnut data={statusChart} options={statusOpts} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Tasks</span>
                <span className="font-semibold text-slate-800">100</span>
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                <p className="text-sm text-slate-500">Active contributors</p>
              </div>
              <a href="/teams" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </a>
            </div>
            <div className="space-y-1">
              {teamMembers.map((member, idx) => (
                <TeamMember key={idx} {...member} />
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-500">Latest updates</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {activities.map((activity, idx) => (
              <ActivityItem key={idx} {...activity} />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
