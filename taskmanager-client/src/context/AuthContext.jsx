import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAuthTokenGetter, setOnUnauthorized } from '../api/axiosInstance';
import { mockAuthenticate, DEV_MODE } from '../config/mockUsers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const getToken = useCallback(() => state.token, [state.token]);

  useEffect(() => {
    setAuthTokenGetter(() => state.token);
  }, [state.token]);

  useEffect(() => {
    setOnUnauthorized(() => {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: savedToken },
        });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const { data } = await authApi.login({ email, password, role });
      const { token, user } = data;

      // Ensure the selected role is stored with user data
      // Backend might not return role, so we add it from the login form
      const userWithRole = {
        ...user,
        roleName: user.roleName || role, // Use backend role if available, otherwise use selected role
        role: user.role || role,
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userWithRole));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userWithRole, token } });
      toast.success(`Welcome back, ${userWithRole.firstName || userWithRole.fullName || 'User'}!`);
      return { success: true };
    } catch (error) {
      // DEV MODE: Try mock authentication if backend fails
      if (DEV_MODE) {
        const mockUser = mockAuthenticate(email, password);
        if (mockUser) {
          const userWithRole = {
            ...mockUser,
            roleName: mockUser.role,
          };
          localStorage.setItem('auth_token', mockUser.token);
          localStorage.setItem('auth_user', JSON.stringify(userWithRole));
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userWithRole, token: mockUser.token } });
          toast.success(`[DEV MODE] Welcome, ${mockUser.firstName}! Logged in as ${mockUser.role}`);
          return { success: true };
        }
      }

      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const { data: result } = await authApi.register(data);
      toast.success('Account created successfully! Please log in.');
      return { success: true, data: result };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Role helper functions
  const getUserRole = useCallback(() => {
    // Check all possible role field names from backend
    // Priority: roleName > role > roles array
    if (state.user?.roleName) {
      return state.user.roleName;
    }
    if (state.user?.role) {
      return state.user.role;
    }
    if (state.user?.roles && state.user.roles.length > 0) {
      // Handle roles as array of objects or strings
      const firstRole = state.user.roles[0];
      return typeof firstRole === 'string' ? firstRole : firstRole?.roleName || firstRole?.name || 'Employee';
    }
    return 'Employee'; // Default role
  }, [state.user]);

  const hasRole = useCallback((role) => {
    // Check all possible role fields
    const currentRole = state.user?.roleName || state.user?.role;
    if (currentRole) {
      return currentRole.toLowerCase() === role?.toLowerCase();
    }
    // Fallback to roles array
    const userRoles = state.user?.roles || [];
    return userRoles.some(r => {
      const roleName = typeof r === 'string' ? r : r?.roleName || r?.name;
      return roleName?.toLowerCase() === role?.toLowerCase();
    });
  }, [state.user]);

  const isAdmin = useCallback(() => hasRole('Admin'), [hasRole]);
  const isManager = useCallback(() => hasRole('Manager') || hasRole('Admin'), [hasRole]);
  const isTeamLead = useCallback(() => hasRole('Team Lead') || hasRole('TeamLead'), [hasRole]);
  const isEmployee = useCallback(() => true, []); // Everyone is at least an employee

  const value = {
    ...state,
    login,
    register,
    logout,
    getToken,
    getUserRole,
    hasRole,
    isAdmin,
    isManager,
    isTeamLead,
    isEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
