import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../utils/chartSetup';
import { Doughnut } from 'react-chartjs-2';
import {
  Users,
  UsersRound,
  ClipboardList,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import { userApi } from '../api/userApi';
import { teamApi } from '../api/teamApi';
import { taskApi } from '../api/taskApi';
import toast from 'react-hot-toast';

/* ─── Stat Card ───────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

/* ─── Quick Action Button ─────────────────────────── */
const QuickAction = ({ icon: Icon, label, description, gradient, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all text-left w-full group"
  >
    <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
  </button>
);

/* ─── Main Dashboard ──────────────────────────────── */
const DashboardPage = () => {
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'Admin', lastName: 'User' };
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [usersRes, teamsRes, tasksRes] = await Promise.all([
          userApi.getAll(),
          teamApi.getAll(),
          taskApi.getAll(),
        ]);
        setUsers(usersRes.data || []);
        setTeams(teamsRes.data || []);
        setTasks(tasksRes.data?.items || tasksRes.data || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Derived stats
  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);

  // Role distribution
  const roleCounts = {};
  users.forEach(u => {
    const roles = u.roles || u.userRoles || [];
    if (roles.length === 0) {
      roleCounts['Unassigned'] = (roleCounts['Unassigned'] || 0) + 1;
    }
    roles.forEach(r => {
      const name = typeof r === 'string' ? r : (r.roleName || r.name || 'Unknown');
      roleCounts[name] = (roleCounts[name] || 0) + 1;
    });
  });

  const roleLabels = Object.keys(roleCounts);
  const roleData = Object.values(roleCounts);
  const roleColors = {
    'Admin': '#f59e0b',
    'Manager': '#3b82f6',
    'Team Lead': '#8b5cf6',
    'TeamLead': '#8b5cf6',
    'Employee': '#10b981',

    'Unassigned': '#94a3b8',
  };

  const roleChartData = {
    labels: roleLabels,
    datasets: [{
      data: roleData,
      backgroundColor: roleLabels.map(l => roleColors[l] || '#6366f1'),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const roleChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } },
    },
  };

  // Active/Inactive chart
  const statusChartData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [activeUsers.length, inactiveUsers.length],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const statusChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } },
    },
  };

  // Recent users (sorted by created date, newest first)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, 6);

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {greeting}, {user.firstName}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">System administration overview for your organization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
              <Calendar className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white/90">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle={`${activeUsers.length} active, ${inactiveUsers.length} inactive`}
          icon={Users}
          gradient="from-indigo-500 to-indigo-600"
          onClick={() => navigate('/users')}
        />
        <StatCard
          title="Total Teams"
          value={teams.length}
          subtitle="Across the organization"
          icon={UsersRound}
          gradient="from-emerald-500 to-emerald-600"
          onClick={() => navigate('/teams')}
        />
        <StatCard
          title="Total Tasks"
          value={Array.isArray(tasks) ? tasks.length : 0}
          subtitle="Organization-wide"
          icon={ClipboardList}
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard
          title="Roles Configured"
          value={roleLabels.filter(r => r !== 'Unassigned').length}
          subtitle={`${roleLabels.length} categories`}
          icon={Shield}
          gradient="from-purple-500 to-purple-600"
          onClick={() => navigate('/roles')}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Users Table */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">User Directory</h3>
                <p className="text-sm text-slate-500">Recently created accounts</p>
              </div>
              <button
                onClick={() => navigate('/users')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                Manage Users <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No users found</td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => {
                      const roles = u.roles || [];
                      const primaryRole = typeof roles[0] === 'string'
                        ? roles[0]
                        : (roles[0]?.roleName || roles[0]?.name || 'Unassigned');
                      const color = roleColors[primaryRole] || '#6366f1';
                      return (
                        <tr key={u.id || u.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                {(u.firstName?.[0] || 'U').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-800">{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {primaryRole}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.isActive ? (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                                <span className="w-2 h-2 rounded-full bg-red-500" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {new Date(u.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Team Overview */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Team Overview</h3>
                <p className="text-sm text-slate-500">{teams.length} teams across the organization</p>
              </div>
              <button
                onClick={() => navigate('/teams')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                Manage Teams <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {teams.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <UsersRound className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No teams created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.slice(0, 6).map((team, idx) => {
                  const gradients = [
                    'from-indigo-500 via-indigo-600 to-purple-700',
                    'from-emerald-500 via-teal-600 to-cyan-700',
                    'from-rose-500 via-pink-600 to-fuchsia-700',
                    'from-amber-500 via-orange-600 to-red-600',
                    'from-violet-500 via-purple-600 to-indigo-700',
                    'from-sky-500 via-blue-600 to-indigo-700',
                  ];
                  const bgGradient = gradients[idx % gradients.length];
                  const memberCount = team.memberCount || team.members?.length || 0;
                  const managerName = team.managerName || team.manager?.name || null;

                  return (
                    <div
                      key={team.teamId || team.id}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/teams/${team.teamId || team.id}`)}
                    >
                      {/* Gradient Header */}
                      <div className={`bg-gradient-to-r ${bgGradient} px-4 py-3 relative overflow-hidden`}>
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
                          <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white/10 rounded-full blur-md" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <UsersRound className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white truncate max-w-[140px]">
                                {team.name || team.teamName || 'Unnamed Team'}
                              </h4>
                              {team.description && (
                                <p className="text-[10px] text-white/70 truncate max-w-[140px]">{team.description}</p>
                              )}
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="px-4 py-3 bg-white space-y-2.5">
                        {/* Manager */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="text-xs text-slate-500">
                            {managerName ? (
                              <>Led by <span className="font-semibold text-slate-700">{managerName}</span></>
                            ) : (
                              <span className="text-slate-400 italic">No manager assigned</span>
                            )}
                          </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-700">{memberCount}</span>
                            <span className="text-[10px] text-slate-400">members</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-emerald-600">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">

          {/* Role Distribution */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Role Distribution</h3>
              <p className="text-sm text-slate-500">Users by role</p>
            </div>
            <div style={{ height: 220 }}>
              <Doughnut data={roleChartData} options={roleChartOpts} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              {roleLabels.map((label, idx) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: roleColors[label] || '#6366f1' }}
                    />
                    <span className="text-slate-600">{label}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{roleData[idx]}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* User Status */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">User Status</h3>
              <p className="text-sm text-slate-500">Active vs inactive</p>
            </div>
            <div style={{ height: 180 }}>
              <Doughnut data={statusChartData} options={statusChartOpts} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-600">Active</span>
                </div>
                <span className="font-semibold text-emerald-600">{activeUsers.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-500" />
                  <span className="text-slate-600">Inactive</span>
                </div>
                <span className="font-semibold text-red-500">{inactiveUsers.length}</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">Manage your system</p>
            </div>
            <div className="space-y-2">
              <QuickAction
                icon={Users}
                label="Manage Users"
                description="Add, edit, or deactivate users"
                gradient="from-indigo-500 to-indigo-600"
                onClick={() => navigate('/users')}
              />
              <QuickAction
                icon={Shield}
                label="Manage Roles"
                description="Configure role permissions"
                gradient="from-purple-500 to-purple-600"
                onClick={() => navigate('/roles')}
              />
              <QuickAction
                icon={UsersRound}
                label="Manage Teams"
                description="Create and organize teams"
                gradient="from-emerald-500 to-emerald-600"
                onClick={() => navigate('/teams')}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
