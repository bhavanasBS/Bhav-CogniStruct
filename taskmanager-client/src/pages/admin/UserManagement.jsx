import { useState, useEffect } from 'react';
import { Plus, Download, Users, UserPlus, Activity, X, Loader2, UserCog, UserX } from 'lucide-react';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import UserList from '../../components/users/UserList';
import UserForm from '../../components/users/UserForm';
import { userApi } from '../../api/userApi';

import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Assign to Manager modal state
  const [assignUser, setAssignUser] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [assigningManagerId, setAssigningManagerId] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        pageSize: 10,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };
      const response = await userApi.getAll(params);
      setUsers(response.data.items || response.data || []);
      setTotalCount(response.data.totalCount || response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await userApi.updateStatus(user.userId || user.id, !user.isActive);
      toast.success(`${user.firstName} has been ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await userApi.update(editingUser.userId || editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await userApi.create(formData);
        toast.success('User created successfully');
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    }
  };

  // Assign to Manager handlers
  const handleOpenAssignModal = async (user) => {
    setAssignUser(user);
    try {
      setLoadingManagers(true);
      // Fetch users with Manager role
      const res = await userApi.getAll({ role: 'Manager' });
      setManagers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAssignToManager = async (managerId) => {
    if (!assignUser) return;
    const userId = assignUser.id || assignUser.userId;
    try {
      setAssigningManagerId(managerId);
      await userApi.assignManager(userId, managerId);
      toast.success(`${assignUser.firstName} assigned to manager successfully!`);
      setAssignUser(null);
      fetchUsers(); // Refresh to show updated manager
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to assign manager';
      toast.error(msg);
    } finally {
      setAssigningManagerId(null);
    }
  };

  // Stats
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;
  const unallocatedUsers = users.filter(u => u.isActive && !u.managerId && u.roles?.some(r => r === 'Employee')).length;

  return (
    <div className="space-y-6">
      {/* Header with Cognitive Styling */}
      <div className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 rounded-2xl p-6 text-white relative overflow-hidden">
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
                User Management
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Manage team members, roles, and access permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={Download}
              className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30"
            >
              Export
            </Button>
            <Button
              icon={UserPlus}
              onClick={() => { setEditingUser(null); setShowForm(true); }}
              className="!bg-white !text-purple-600 hover:!bg-white/90"
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeUsers}</p>
              <p className="text-xs text-slate-500">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{inactiveUsers}</p>
              <p className="text-xs text-slate-500">Inactive Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{unallocatedUsers}</p>
              <p className="text-xs text-slate-500">Unallocated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <SearchBar
            placeholder="Search users by name or email..."
            onSearch={setSearch}
            className="flex-1 max-w-md"
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {['all', 'active', 'inactive', 'unallocated'].map((status) => {
              const labels = { all: 'All', active: 'Active', inactive: 'Inactive', unallocated: 'Unallocated' };
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === status
                    ? status === 'unallocated'
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
            <Users className="h-4 w-4" />
            {users.length} users
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <UserList
          users={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onAssignManager={handleOpenAssignModal}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalCount / 10)}
        totalCount={totalCount}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* User Form Modal */}
      <UserForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingUser(null); }}
        onSubmit={handleSubmit}
        user={editingUser}
      />

      {/* Assign to Manager Modal */}
      {assignUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Assign to Manager</h2>
                  <p className="text-xs text-slate-400">
                    Assign <span className="font-semibold text-slate-600">{assignUser.firstName} {assignUser.lastName}</span> to report to a manager
                  </p>
                </div>
              </div>
              <button onClick={() => setAssignUser(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Current Manager Info */}
            {assignUser.managerName && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-600">
                  Currently reports to: <span className="font-semibold">{assignUser.managerName}</span>
                </p>
              </div>
            )}

            {/* Manager List */}
            <div className="max-h-80 overflow-y-auto">
              {loadingManagers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : managers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <UserCog className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No managers found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {managers
                    .filter(m => m.id !== (assignUser.id || assignUser.userId))
                    .map((manager) => {
                      const isCurrentManager = assignUser.managerId === manager.id;
                      return (
                        <div key={manager.id} className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-50/50 transition-colors ${isCurrentManager ? 'bg-blue-50/30' : ''}`}>
                          {/* Manager avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(manager.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>

                          {/* Manager info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{manager.name}</p>
                            <p className="text-xs text-slate-400 truncate">{manager.email}</p>
                          </div>

                          {/* Role badge */}
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {manager.role}
                          </span>

                          {/* Assign button */}
                          {isCurrentManager ? (
                            <span className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAssignToManager(manager.id)}
                              disabled={assigningManagerId === manager.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              {assigningManagerId === manager.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UserCog className="w-3.5 h-3.5" />
                              )}
                              Assign
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setAssignUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
