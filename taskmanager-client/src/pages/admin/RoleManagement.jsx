import { useState } from 'react';
import { Shield, Users, Sparkles, Crown, Briefcase, UserCheck, Users2, HeartHandshake, Edit2, Settings } from 'lucide-react';
import Card from '../../components/common/Card';
import { getRoleBadgeColor } from '../../utils/roleUtils';

const roleIcons = {
  Admin: Crown,
  Manager: Briefcase,
  Employee: UserCheck,
  TeamLead: Users2,
  HR: HeartHandshake,
};

const roleGradients = {
  Admin: 'from-purple-500 to-purple-600',
  Manager: 'from-blue-500 to-blue-600',
  Employee: 'from-emerald-500 to-emerald-600',
  TeamLead: 'from-amber-500 to-amber-600',
  HR: 'from-rose-500 to-rose-600',
};

const roleBgColors = {
  Admin: 'bg-purple-50 border-purple-200',
  Manager: 'bg-blue-50 border-blue-200',
  Employee: 'bg-emerald-50 border-emerald-200',
  TeamLead: 'bg-amber-50 border-amber-200',
  HR: 'bg-rose-50 border-rose-200',
};

const RoleManagement = () => {
  const [roles] = useState([
    { roleId: 1, roleName: 'Admin', userCount: 2, description: 'Full system control — user CRUD, role assignment, system configuration', permissions: ['All Access', 'User Management', 'System Config'] },
    { roleId: 2, roleName: 'Manager', userCount: 5, description: 'Team management, task assignment, view team analytics, approve time logs', permissions: ['Team View', 'Task Assignment', 'Approvals'] },
    { roleId: 3, roleName: 'Employee', userCount: 18, description: 'View assigned tasks, log work hours, update task status', permissions: ['View Tasks', 'Log Hours', 'Update Status'] },
    { roleId: 4, roleName: 'TeamLead', userCount: 4, description: 'Assign tasks within team, view team progress, limited reporting', permissions: ['Team Tasks', 'Progress View', 'Reports'] },
    { roleId: 5, roleName: 'HR', userCount: 3, description: 'View employee records, performance reports, team structures', permissions: ['Employee Records', 'Performance', 'Teams'] },
  ]);

  const totalUsers = roles.reduce((acc, r) => acc + r.userCount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Cognitive Styling */}
      <div className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Role Management
                <Sparkles className="w-5 h-5 text-amber-300" />
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Define and manage system roles and their permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold">{roles.length}</p>
              <p className="text-white/70 text-sm">Total Roles</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-right">
              <p className="text-3xl font-bold">{totalUsers}</p>
              <p className="text-white/70 text-sm">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const IconComponent = roleIcons[role.roleName] || Shield;
          const gradient = roleGradients[role.roleName] || 'from-slate-500 to-slate-600';
          const bgColor = roleBgColors[role.roleName] || 'bg-slate-50 border-slate-200';

          return (
            <div
              key={role.roleId}
              className={`${bgColor} border rounded-2xl p-5 hover:shadow-lg transition-all hover:scale-[1.02] group`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{role.roleName}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>{role.userCount} users</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{role.description}</p>

              {/* Permissions Tags */}
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-1 bg-white/70 text-slate-600 text-xs font-medium rounded-md border border-slate-200/50"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-rose-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Role-Based Access Control</h4>
            <p className="text-sm text-slate-600">
              Each role defines specific permissions that control what users can access and modify.
              Users can be assigned multiple roles for flexible access management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
