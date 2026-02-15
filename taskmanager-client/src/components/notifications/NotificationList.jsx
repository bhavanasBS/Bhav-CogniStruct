import { Check, CheckCheck, Clock, AlertCircle, MessageSquare, Users, X } from 'lucide-react';
import { getRelativeTime } from '../../utils/dateUtils';

const typeConfig = {
  task_assigned: { icon: AlertCircle, color: 'text-primary-500 bg-primary-50' },
  task_completed: { icon: Check, color: 'text-accent-500 bg-accent-50' },
  comment: { icon: MessageSquare, color: 'text-purple-500 bg-purple-50' },
  team_update: { icon: Users, color: 'text-warning-500 bg-warning-50' },
  deadline: { icon: Clock, color: 'text-danger-500 bg-danger-50' },
};

const demoNotifications = [
  { id: 1, type: 'task_assigned', message: 'You were assigned "Implement workload balancing"', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), isRead: false },
  { id: 2, type: 'task_completed', message: 'Priya Sharma completed "User authentication module"', createdAt: new Date(Date.now() - 30 * 60000).toISOString(), isRead: false },
  { id: 3, type: 'deadline', message: '"Database migration scripts" is due tomorrow', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false },
  { id: 4, type: 'comment', message: 'Rahul Gupta commented on "API Documentation"', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), isRead: true },
  { id: 5, type: 'team_update', message: 'You were added to "DevOps" team', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), isRead: true },
];

const NotificationList = ({ notifications, onMarkRead, onMarkAllRead, onClose }) => {
  const items = notifications?.length ? notifications : demoNotifications;
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
          {unread > 0 && <p className="text-xs text-slate-400">{unread} unread</p>}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No notifications</div>
        ) : (
          items.map((n) => {
            const config = typeConfig[n.type] || typeConfig.task_assigned;
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                onClick={() => onMarkRead?.(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left cursor-pointer ${
                  !n.isRead ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${config.color} mt-0.5`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{getRelativeTime(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationList;
