import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { getPrimaryRole, getRoleBadgeColor } from '../../utils/roleUtils';

const getProfileRoute = (role) => {
  const map = { Admin: '/admin/profile', Manager: '/manager/profile', TeamLead: '/teamlead/profile', 'Team Lead': '/teamlead/profile', Employee: '/employee/profile' };
  return map[role] || '/employee/profile';
};

const Header = ({ onToggleSidebar }) => {
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'User', lastName: '', roles: [], email: '' };
  const logout = authCtx?.logout || (() => { });
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryRole = getPrimaryRole(user);
  const avatarColor = generateAvatarColor(user?.firstName || '');

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6">
      {/* Left — Mobile hamburger only */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right — Profile only */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
            }}
            className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:pr-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${avatarColor} text-white flex items-center justify-center text-[10px] sm:text-xs font-bold`}
            >
              {getInitials(user)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-slate-400">{primaryRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-block mt-1.5 badge ${getRoleBadgeColor(primaryRole)}`}>
                  {primaryRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate(getProfileRoute(getPrimaryRole(user)));
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => {
                    logout();
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
