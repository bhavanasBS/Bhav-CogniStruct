import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { hasAnyRole } from '../utils/roleUtils';
import { PageLoader } from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { state } = useAuthContext();
  const location = useLocation();

  if (state.isLoading) {
    return <PageLoader />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(state.user, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
