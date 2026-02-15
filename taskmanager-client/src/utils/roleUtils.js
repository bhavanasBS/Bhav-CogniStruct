import { ROLES } from './constants';

export const hasRole = (user, role) => {
  if (!user?.roles) return false;
  return user.roles.includes(role);
};

export const hasAnyRole = (user, roles) => {
  if (!user?.roles) return false;
  return roles.some((r) => user.roles.includes(r));
};

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isManager = (user) => hasRole(user, ROLES.MANAGER);
export const isTeamLead = (user) => hasRole(user, ROLES.TEAM_LEAD);
export const isEmployee = (user) => hasRole(user, ROLES.EMPLOYEE);
export const isHR = (user) => hasRole(user, ROLES.HR);

export const canManageTasks = (user) =>
  hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]);

export const canViewAnalytics = (user) =>
  hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR]);

export const canManageUsers = (user) => isAdmin(user);
export const canManageTeams = (user) =>
  hasAnyRole(user, [ROLES.ADMIN, ROLES.MANAGER]);

export const getPrimaryRole = (user) => {
  // Check all possible role field names
  // Priority: roleName > role > roles array
  if (user?.roleName) {
    return user.roleName;
  }
  if (user?.role) {
    return user.role;
  }
  if (user?.roles?.length) {
    const priority = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.HR, ROLES.EMPLOYEE];
    for (const role of priority) {
      if (user.roles.includes(role)) return role;
    }
    return user.roles[0];
  }
  return 'User';
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
    [ROLES.MANAGER]: 'bg-primary-100 text-primary-700',
    [ROLES.TEAM_LEAD]: 'bg-cyan-100 text-cyan-700',
    [ROLES.EMPLOYEE]: 'bg-slate-100 text-slate-700',
    [ROLES.HR]: 'bg-amber-100 text-amber-700',
  };
  return colors[role] || 'bg-slate-100 text-slate-700';
};
