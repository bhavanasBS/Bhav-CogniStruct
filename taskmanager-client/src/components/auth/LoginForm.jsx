import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ChevronDown, Check } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const roleOptions = [
  { value: ROLES.ADMIN, label: 'Admin', desc: 'Full system access', color: '#f59e0b' },
  { value: ROLES.MANAGER, label: 'Manager', desc: 'Team management', color: '#3b82f6' },
  { value: ROLES.TEAM_LEAD, label: 'Team Lead', desc: 'Lead operations', color: '#8b5cf6' },
  { value: ROLES.EMPLOYEE, label: 'Employee', desc: 'Task execution', color: '#10b981' },
  { value: ROLES.HR, label: 'HR', desc: 'People management', color: '#ec4899' },
];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedRole = roleOptions.find((r) => r.value === role);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Must be at least 6 characters';
    if (!role) errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const result = await login(email, password, role);
    setIsLoading(false);
    if (result.success) {
      // Redirect based on role
      const roleRedirects = {
        'Admin': '/dashboard',
        'Manager': '/manager/dashboard',
        'Team Lead': '/teamlead/dashboard',
        'TeamLead': '/teamlead/dashboard',
        'Employee': '/employee/dashboard',
        'HR': '/hr/dashboard',
      };
      const redirectPath = roleRedirects[role] || '/employee/dashboard';
      navigate(redirectPath);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            placeholder="you@company.com"
            autoComplete="email"
            className={`w-full h-12 rounded-xl border bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.email
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
              }`}
            style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full h-12 rounded-xl border bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 transition-all outline-none ${errors.password
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
              }`}
            style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
      </div>

      {/* Role Selector */}
      <div ref={roleRef} className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Sign in as
        </label>
        <button
          type="button"
          onClick={() => setRoleOpen(!roleOpen)}
          className={`w-full h-12 rounded-xl border bg-slate-50 text-left flex items-center justify-between transition-all outline-none ${errors.role
            ? 'border-red-400'
            : roleOpen
              ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white'
              : 'border-slate-200 hover:border-slate-300'
            }`}
          style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
        >
          {selectedRole ? (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: selectedRole.color }}
              >
                {selectedRole.label.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{selectedRole.label}</p>
                <p className="text-xs text-slate-400">{selectedRole.desc}</p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400">Select your role</span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {roleOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 py-2 overflow-hidden">
            {roleOptions.map((r) => {
              const isSelected = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setRoleOpen(false); setErrors((p) => ({ ...p, role: '' })); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.label.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                      {r.label}
                    </p>
                    <p className="text-xs text-slate-400">{r.desc}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}
        {errors.role && <p className="text-xs text-red-500 mt-1.5">{errors.role}</p>}
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
        />
        <span className="text-sm text-slate-600">Remember me for 30 days</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
