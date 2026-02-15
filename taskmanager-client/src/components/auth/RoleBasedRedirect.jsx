import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

/**
 * RoleBasedRedirect - Redirects users to their role-specific homepage
 * Use this at the root "/" route to send users to their dashboard
 */
const RoleBasedRedirect = () => {
    const { user, isAuthenticated, isLoading, getUserRole } = useAuthContext();
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
        return <Navigate to="/login" replace />;
    }

    // Redirect based on role
    const roleHomepages = {
        'Admin': '/dashboard',
        'Manager': '/manager/dashboard',
        'Team Lead': '/teamlead/dashboard',
        'TeamLead': '/teamlead/dashboard',
        'Employee': '/employee/dashboard',
        'HR': '/hr/dashboard',
    };

    const homepage = roleHomepages[userRole] || '/employee/dashboard';

    return <Navigate to={homepage} replace />;
};

export default RoleBasedRedirect;
