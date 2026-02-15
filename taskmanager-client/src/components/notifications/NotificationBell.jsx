import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationList from './NotificationList';

const NotificationBell = ({ notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <NotificationList
            notifications={notifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
