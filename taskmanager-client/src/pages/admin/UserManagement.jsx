import { useState, useEffect } from 'react';
import { Plus, Download, Users, Sparkles, UserPlus, Activity } from 'lucide-react';
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

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        pageSize: 10,
        search: search || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
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
      await userApi.updateStatus(user.userId, !user.isActive);
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
        await userApi.update(editingUser.userId, formData);
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

  // Stats
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header with Cognitive Styling */}
      <div className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
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
                <Sparkles className="w-5 h-5 text-amber-300" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${statusFilter === status
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {status}
              </button>
            ))}
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
    </div>
  );
};

export default UserManagement;
