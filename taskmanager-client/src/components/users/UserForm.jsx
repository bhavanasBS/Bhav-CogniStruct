import { useState, useEffect } from 'react';
import { Mail, User, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

const UserForm = ({ isOpen, onClose, onSubmit, user = null, roles = [], isLoading }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedRole: null,
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        selectedRole: user?.roles?.[0]?.roleName || user?.roles?.[0] || null,
        isActive: user?.isActive ?? true,
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, user]);

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const selectRole = (roleName) => {
    setForm((p) => ({ ...p, selectedRole: roleName }));
    setErrors((p) => ({ ...p, role: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!isEdit) {
      if (!form.password) {
        errs.password = 'Password is required';
      } else if (form.password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
      if (!form.confirmPassword) {
        errs.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }
    if (!form.selectedRole) errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const { confirmPassword, selectedRole, ...submitData } = form;
    // Send roles as array of role name strings matching backend CreateUserRequest.Roles
    onSubmit({ ...submitData, roles: [selectedRole] });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Create New User'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={form.firstName}
                onChange={handleChange('firstName')}
                className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.firstName
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                  }`}
                placeholder="John"
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
            <input
              value={form.lastName}
              onChange={handleChange('lastName')}
              className={`w-full h-10 px-3 rounded-lg border bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.lastName
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.email
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                }`}
              placeholder="user@company.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Password Fields - Only show for new users */}
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : form.confirmPassword && form.password === form.confirmPassword
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-emerald-600 mt-1">✓ Passwords match</p>
              )}
            </div>
          </div>
        )}

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Roles
          </label>
          <div className="flex flex-wrap gap-2">
            {(roles.length > 0 ? roles : [
              { roleId: 1, roleName: 'Admin' },
              { roleId: 2, roleName: 'Manager' },
              { roleId: 3, roleName: 'Employee' },
              { roleId: 4, roleName: 'TeamLead' },
              { roleId: 5, roleName: 'HR' },
            ]).map((role) => (
              <button
                key={role.roleId}
                type="button"
                onClick={() => selectRole(role.roleName)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${form.selectedRole === role.roleName
                  ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {role.roleName}
              </button>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
        </div>

        {/* Account Status Toggle - Only for edit mode */}
        {isEdit && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <label className="text-sm font-medium text-slate-700">Account Status</label>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? 'translate-x-5' : ''
                }`} />
            </button>
            <span className={`text-sm font-medium ${form.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserForm;
