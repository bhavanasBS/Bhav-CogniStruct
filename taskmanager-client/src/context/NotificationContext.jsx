import { createContext, useContext, useReducer, useCallback } from 'react';

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
          n.notificationId === action.payload ? { ...n, isRead: true } : n
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

  const setNotifications = useCallback((notifications) => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
  }, []);

  const setUnreadCount = useCallback((count) => {
    dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const value = {
    ...state,
    setNotifications,
    setUnreadCount,
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
