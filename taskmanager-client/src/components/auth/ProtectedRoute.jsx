import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute - A wrapper component that restricts route access based on user role
 * 
 * @param {React.ReactNode} children - The component to render if access is granted
 * @param {string[]} allowedRoles - Array of roles that can access this route (e.g., ['Admin', 'Manager'])
 * @param {string} redirectTo - Path to redirect to if access is denied (default: role-based dashboard)
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo }) => {
    const { user, isAuthenticated, isLoading, getUserRole } = useAuthContext();
    const location = useLocation();
    const userRole = getUserRole();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no roles specified, allow all authenticated users
    if (allowedRoles.length === 0) {
        return children;
    }

    // Check if user has required role
    const hasAccess = allowedRoles.some(role =>
        userRole?.toLowerCase() === role.toLowerCase() ||
        (role === 'TeamLead' && userRole === 'Team Lead')
    );

    if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        const roleRedirects = {
            'Admin': '/dashboard',
            'Manager': '/manager/dashboard',
            'Team Lead': '/teamlead/dashboard',
            'TeamLead': '/teamlead/dashboard',
            'Employee': '/employee/dashboard',
        };

        const redirectPath = redirectTo || roleRedirects[userRole] || '/employee/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
