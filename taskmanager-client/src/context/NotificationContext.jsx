import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import api from '../api/axiosInstance';

const NotificationContext = createContext(null);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload, isLoading: false };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/api/notifications?limit=10');
      dispatch({ type: 'SET_NOTIFICATIONS', payload: res.data });
    } catch {
      // silently fail
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/api/notifications/unread-count');
      dispatch({ type: 'SET_UNREAD_COUNT', payload: res.data.count });
    } catch {
      // silently fail
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all');
      dispatch({ type: 'MARK_ALL_READ' });
    } catch {
      // silently fail
    }
  }, []);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
