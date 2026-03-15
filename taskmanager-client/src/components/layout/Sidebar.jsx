import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardList,
  Clock,
  BarChart3,
  Scale,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  Brain,
  CheckSquare,
  Settings,
  TrendingUp,
  Award,
  Mail,
  FolderKanban,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

// Navigation configuration by role — EVERY link must be role-prefixed
const getNavigationByRole = (userRole) => {
  const allNavigation = {

    // Admin only — /dashboard, /users, /roles
    admin: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
      { name: 'Users', href: '/users', icon: Users, color: 'from-violet-500 to-violet-600' },
      { name: 'Teams', href: '/teams', icon: UsersRound, color: 'from-indigo-500 to-indigo-600' },
      { name: 'Roles', href: '/roles', icon: Shield, color: 'from-pink-500 to-pink-600' },

    ],

    // Manager — all /manager/ prefixed
    manager: [
      { name: 'My Dashboard', href: '/manager/dashboard', icon: LayoutDashboard, color: 'from-cyan-500 to-cyan-600' },

      { name: 'Tasks', href: '/manager/tasks', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
      { name: 'Projects', href: '/manager/projects', icon: FolderKanban, color: 'from-violet-500 to-indigo-600' },
      { name: 'Teams', href: '/manager/teams', icon: UsersRound, color: 'from-indigo-500 to-indigo-600' },
      { name: 'Approvals', href: '/manager/approvals', icon: CheckSquare, color: 'from-amber-500 to-amber-600' },
      { name: 'Time Logs', href: '/manager/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Analytics', href: '/manager/analytics', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
      { name: 'Performance Reviews', href: '/manager/reviews', icon: Award, color: 'from-purple-500 to-violet-600' },
    ],

    // Team Lead — all /teamlead/ prefixed
    teamLead: [
      { name: 'Team Dashboard', href: '/teamlead/dashboard', icon: LayoutDashboard, color: 'from-amber-500 to-orange-600' },
      { name: 'My Projects', href: '/teamlead/projects', icon: FolderKanban, color: 'from-purple-500 to-indigo-600' },

      { name: 'Tasks', href: '/teamlead/tasks', icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
      { name: 'Time Logs', href: '/teamlead/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Workload', href: '/teamlead/workload', icon: Scale, color: 'from-rose-500 to-rose-600' },
      { name: 'Pause Requests', href: '/teamlead/pause-requests', icon: ShieldAlert, color: 'from-red-500 to-red-600' },
    ],

    // Employee — all /employee/ prefixed
    employee: [
      { name: 'My Dashboard', href: '/employee/dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
      { name: 'My Tasks', href: '/employee/tasks', icon: CheckSquare, color: 'from-blue-500 to-blue-600' },
      { name: 'Time Logs', href: '/employee/time-logs', icon: Clock, color: 'from-amber-500 to-amber-600' },
      { name: 'Skill Progress', href: '/employee/skills', icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
      { name: 'My Reviews', href: '/employee/reviews', icon: Award, color: 'from-purple-500 to-violet-600' },
      { name: 'My Progress', href: '/employee/progress', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
    ],
  };

  if (userRole === 'Admin') return allNavigation.admin;
  if (userRole === 'Manager') return allNavigation.manager;
  if (userRole === 'Team Lead' || userRole === 'TeamLead') return allNavigation.teamLead;

  return allNavigation.employee;
};

const getSettingsNav = () => ({
  name: 'Settings',
  href: '/settings',
  icon: Settings,
  color: 'from-slate-500 to-slate-600',
});

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'User', lastName: '', email: '' };

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const getRoleFromPath = () => {
    const path = location.pathname;
    if (path.startsWith('/teamlead')) return 'TeamLead';
    if (path.startsWith('/manager')) return 'Manager';
    if (path.startsWith('/employee')) return 'Employee';
    const adminPaths = ['/dashboard', '/users', '/roles', '/teams'];
    if (adminPaths.some(p => path === p || path.startsWith(p + '/'))) return 'Admin';
    return null;
  };

  const detectedRole = getRoleFromPath();
  const userRole = authCtx?.getUserRole?.() || detectedRole || 'Employee';
  const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || ''}`;
  const navigation = getNavigationByRole(userRole);
  const settingsNav = getSettingsNav();

  const handleLogout = () => {
    authCtx?.logout?.();
  };

  // Desktop: always visible, fixed w-64 or w-[72px] when collapsed
  // Mobile: overlay slide-in from left, controlled by isOpen prop
  const desktopWidth = collapsed ? 'w-[72px]' : 'w-64';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-black text-white flex flex-col
          transition-all duration-300 ease-in-out

          /* Mobile: slide in/out */
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64

          /* Desktop: always visible, respect collapsed state */
          lg:translate-x-0 lg:z-40 lg:${desktopWidth}
        `}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-rose-900/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo + Mobile Close */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 via-rose-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold tracking-tight whitespace-nowrap flex items-center gap-1.5">
                  CogniStruct
                </h1>
                <p className="text-[10px] text-white/40 whitespace-nowrap tracking-wider uppercase">Task Platform</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
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

          {/* Settings */}
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

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200 text-xs cursor-pointer group"
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
    </>
  );
};

export default Sidebar;
