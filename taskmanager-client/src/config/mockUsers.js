/**
 * DEV ONLY - Mock Users for RBAC Testing
 * ===========================================
 * This file contains static mock user credentials for testing
 * role-based access control without a backend server.
 * 
 * ⚠️ DO NOT USE IN PRODUCTION
 * These credentials are fake and only for UI/RBAC testing.
 */

export const MOCK_USERS = [
    {
        id: 1,
        email: 'admin@test.com',
        password: 'admin123',
        role: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
    },
    {
        id: 2,
        email: 'manager@test.com',
        password: 'manager123',
        role: 'Manager',
        firstName: 'Manager',
        lastName: 'User',
    },
    {
        id: 3,
        email: 'employee@test.com',
        password: 'employee123',
        role: 'Employee',
        firstName: 'Employee',
        lastName: 'User',
    },
    {
        id: 4,
        email: 'hr@test.com',
        password: 'hr@123',
        role: 'HR',
        firstName: 'HR',
        lastName: 'User',
    },
    {
        id: 5,
        email: 'teamlead@test.com',
        password: 'lead123',
        role: 'Team Lead',
        firstName: 'Team',
        lastName: 'Lead',
    },
];

// Check if we're in development mode
export const DEV_MODE = import.meta.env.DEV;

/**
 * Mock authentication function
 * Returns user object if credentials match, null otherwise
 */
export const mockAuthenticate = (email, password) => {
    if (!DEV_MODE) return null;

    const user = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token: `mock_token_${user.role.toLowerCase().replace(' ', '_')}_${Date.now()}`,
        };
    }

    return null;
};
