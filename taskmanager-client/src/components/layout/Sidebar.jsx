import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardList,
  Clock,
  BarChart3,
  Scale,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  Brain,
  Sparkles,
  Target,
  Timer,
  CheckSquare,
  Settings,
  Trophy,
  Award,
  Activity,
  Server,
  Heart,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

// Navigation configuration by role
const getNavigationByRole = (userRole) => {
  const allNavigation = {
    // Common - visible to all
    common: [
      { name: 'Tasks', href: '/tasks', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
      { name: 'Time Logs', href: '/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
    ],

    // Admin only
    admin: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
      { name: 'Users', href: '/users', icon: Users, color: 'from-violet-500 to-violet-600' },
      { name: 'Roles', href: '/roles', icon: Shield, color: 'from-pink-500 to-pink-600' },
      { name: 'Teams', href: '/teams', icon: UsersRound, color: 'from-emerald-500 to-emerald-600' },
    ],

    // Manager
    manager: [
      { name: 'My Dashboard', href: '/manager/dashboard', icon: LayoutDashboard, color: 'from-cyan-500 to-cyan-600' },
      { name: 'My Team', href: '/manager/team', icon: UsersRound, color: 'from-teal-500 to-teal-600' },
      { name: 'Tasks', href: '/tasks', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
      { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare, color: 'from-amber-500 to-amber-600' },
      { name: 'Team Pulse', href: '/manager/pulse', icon: Target, color: 'from-rose-500 to-rose-600' },
      { name: 'Time Logs', href: '/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
    ],

    // Team Lead
    teamLead: [
      { name: 'Team Dashboard', href: '/teamlead/dashboard', icon: LayoutDashboard, color: 'from-amber-500 to-orange-600' },
      { name: 'My Team', href: '/teamlead/team', icon: UsersRound, color: 'from-teal-500 to-teal-600' },
      { name: 'Tasks', href: '/tasks', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
      { name: 'Time Logs', href: '/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Workload', href: '/workload', icon: Scale, color: 'from-rose-500 to-rose-600' },
    ],

    // Employee
    employee: [
      { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
      { name: 'My Tasks', href: '/employee/tasks', icon: CheckSquare, color: 'from-blue-500 to-blue-600' },
      { name: 'Focus Mode', href: '/employee/focus', icon: Timer, color: 'from-rose-500 to-rose-600' },
      { name: 'Time Logs', href: '/employee/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'My Goals', href: '/employee/goals', icon: Target, color: 'from-emerald-500 to-emerald-600' },
      { name: 'Skill Progress', href: '/employee/skills', icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
      { name: 'Peer Recognition', href: '/employee/recognition', icon: Heart, color: 'from-rose-500 to-pink-600' },
      { name: 'Weekly Reflection', href: '/employee/reflection', icon: FileText, color: 'from-teal-500 to-cyan-600' },
      { name: 'Leaderboard', href: '/employee/leaderboard', icon: Trophy, color: 'from-amber-400 to-orange-500' },
      { name: 'Achievements', href: '/employee/achievements', icon: Award, color: 'from-indigo-500 to-purple-600' },
    ],

    // HR
    hr: [
      { name: 'HR Dashboard', href: '/hr/dashboard', icon: LayoutDashboard, color: 'from-pink-500 to-rose-600' },
      { name: 'Employees', href: '/hr/employees', icon: Users, color: 'from-violet-500 to-violet-600' },
      { name: 'Teams', href: '/hr/teams', icon: UsersRound, color: 'from-emerald-500 to-emerald-600' },
      { name: 'Time Logs', href: '/hr/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Analytics', href: '/hr/analytics', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
    ],
  };

  // Map role to navigation
  const roleKey = userRole?.toLowerCase().replace(' ', '');

  if (userRole === 'Admin') return allNavigation.admin;
  if (userRole === 'Manager') return allNavigation.manager;
  if (userRole === 'Team Lead' || userRole === 'TeamLead') return allNavigation.teamLead;
  if (userRole === 'HR') return allNavigation.hr;

  // Default to employee
  return allNavigation.employee;
};

// Get settings link (common to all)
const getSettingsNav = () => ({
  name: 'Settings',
  href: '/settings',
  icon: Settings,
  color: 'from-slate-500 to-slate-600',
});

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'User', lastName: '', email: '' };

  // Get role from context, or infer from URL path for testing
  const getRoleFromPath = () => {
    const path = location.pathname;

    // TeamLead paths
    if (path.startsWith('/teamlead/') || path === '/teamlead') return 'TeamLead';

    // Manager paths
    if (path.startsWith('/manager/') || path === '/manager') return 'Manager';

    // Employee-specific paths
    if (path.startsWith('/employee/') || path === '/employee') return 'Employee';

    // HR paths
    if (path.startsWith('/hr/') || path === '/hr') return 'HR';

    // Admin paths - includes all main dashboard and admin-specific pages
    const adminPaths = [
      '/dashboard', '/users', '/roles', '/teams'
    ];
    if (adminPaths.some(p => path === p || path.startsWith(p + '/'))) {
      return 'Admin';
    }

    // For neutral paths like /settings, try to get from sessionStorage
    const savedRole = sessionStorage.getItem('lastKnownRole');
    if (savedRole) return savedRole;

    return null;
  };

  const detectedRole = getRoleFromPath();

  // Save role to sessionStorage when we detect a specific role (not for neutral paths)
  if (detectedRole && !['/settings', '/leaderboard', '/achievements'].some(p => location.pathname.startsWith(p))) {
    sessionStorage.setItem('lastKnownRole', detectedRole);
  }

  const userRole = authCtx?.getUserRole?.() !== 'Employee'
    ? authCtx?.getUserRole?.()
    : (detectedRole || 'Employee');

  const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`;

  const navigation = getNavigationByRole(userRole);
  const settingsNav = getSettingsNav();

  const handleLogout = () => {
    authCtx?.logout?.();
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-black text-white transition-all duration-300 ease-in-out flex flex-col ${collapsed ? 'w-[72px]' : 'w-64'
        }`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-rose-900/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center h-16 px-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 via-rose-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight whitespace-nowrap flex items-center gap-1.5">
                CogniStruct
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
              <p className="text-[10px] text-white/40 whitespace-nowrap tracking-wider uppercase">Task Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="relative px-4 py-2 border-b border-white/[0.08]">
          <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-white/10">
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Logged in as</p>
            <p className="text-xs font-semibold text-white">{userRole}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <div className="mb-5">
          {/* Section label */}
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Menu
            </p>
          )}
          {collapsed && <div className="mx-auto mb-2 w-6 border-t border-white/[0.08]" />}

          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.06] text-white backdrop-blur-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  title={collapsed ? item.name : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-purple-400 to-rose-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                  )}
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive
                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                    : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
                    }`}>
                    <item.icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                        }`}
                    />
                  </div>
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Settings - separate section */}
        <div className="mt-auto pt-3 border-t border-white/[0.08]">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
              Account
            </p>
          )}
          <NavLink
            to={settingsNav.href}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${location.pathname === settingsNav.href
              ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.06] text-white backdrop-blur-sm'
              : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            title={collapsed ? settingsNav.name : undefined}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${location.pathname === settingsNav.href
              ? `bg-gradient-to-br ${settingsNav.color} shadow-lg`
              : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
              }`}>
              <settingsNav.icon className="h-4 w-4 flex-shrink-0 text-white/50 group-hover:text-white/80" />
            </div>
            {!collapsed && <span className="whitespace-nowrap">{settingsNav.name}</span>}
          </NavLink>
        </div>
      </nav>

      {/* Bottom controls */}
      <div className="relative p-3 border-t border-white/[0.08]">
        {/* User avatar row */}
        <div className={`flex items-center gap-3 px-2 py-2.5 mb-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[11px] font-bold text-white ring-1 ring-white/20 shadow-lg shadow-emerald-500/30">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/90 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-white/40 hover:text-rose-400" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200 text-xs cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-white/[0.06] group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </div>
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
