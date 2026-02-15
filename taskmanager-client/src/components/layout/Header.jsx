import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { getPrimaryRole, getRoleBadgeColor } from '../../utils/roleUtils';

const Header = () => {
  const authCtx = useAuthContext();
  const user = authCtx?.user || { firstName: 'User', lastName: '', roles: [], email: '' };
  const logout = authCtx?.logout || (() => { });
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryRole = getPrimaryRole(user);
  const avatarColor = generateAvatarColor(user?.firstName || '');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {user?.firstName || 'User'}
          </h2>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-danger-500 text-white text-[10px] font-bold px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="py-6 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 mx-1" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-lg ${avatarColor} text-white flex items-center justify-center text-xs font-bold`}
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
                    navigate('/profile');
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
