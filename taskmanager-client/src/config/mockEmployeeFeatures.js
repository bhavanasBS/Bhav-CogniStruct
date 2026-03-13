/**
 * Mock Data for Employee Enhancement Features
 * ============================================
 * DEV ONLY - Static data for testing without backend
 */

// Skills data for self-rating
export const SKILLS_CATALOG = [
    { id: 1, name: 'JavaScript', category: 'Technical' },
    { id: 2, name: 'React', category: 'Technical' },
    { id: 3, name: 'Node.js', category: 'Technical' },
    { id: 4, name: 'SQL/Database', category: 'Technical' },
    { id: 5, name: 'Python', category: 'Technical' },
    { id: 6, name: 'Communication', category: 'Soft Skills' },
    { id: 7, name: 'Team Collaboration', category: 'Soft Skills' },
    { id: 8, name: 'Problem Solving', category: 'Soft Skills' },
    { id: 9, name: 'Time Management', category: 'Soft Skills' },
    { id: 10, name: 'Leadership', category: 'Soft Skills' },
    { id: 11, name: 'Project Management', category: 'Management' },
    { id: 12, name: 'Agile/Scrum', category: 'Management' },
];

// User skill ratings (stored per user)
export const USER_SKILLS = [
    { skillId: 1, rating: 4, userId: 3 },
    { skillId: 2, rating: 4, userId: 3 },
    { skillId: 6, rating: 3, userId: 3 },
    { skillId: 8, rating: 5, userId: 3 },
];

// Training requests
export const TRAINING_REQUESTS = [
    { id: 1, userId: 3, skillId: 5, status: 'pending', requestedAt: '2026-02-05' },
    { id: 2, userId: 3, skillId: 11, status: 'approved', requestedAt: '2026-01-20' },
];

// Blocker categories
export const BLOCKER_CATEGORIES = [
    { id: 'waiting', name: 'Waiting for Others', icon: '⏳' },
    { id: 'unclear', name: 'Unclear Requirements', icon: '❓' },
    { id: 'technical', name: 'Technical Issue', icon: '🔧' },
    { id: 'access', name: 'Access/Permissions', icon: '🔒' },
    { id: 'dependency', name: 'External Dependency', icon: '🔗' },
    { id: 'resource', name: 'Resource Unavailable', icon: '📦' },
];

// Reported blockers
export const BLOCKERS_DATA = [
    {
        id: 1,
        taskId: 101,
        taskTitle: 'Implement Payment Gateway',
        userId: 3,
        category: 'waiting',
        description: 'Waiting for API credentials from payment provider',
        status: 'active',
        createdAt: '2026-02-08T09:00:00',
        resolvedAt: null,
    },
    {
        id: 2,
        taskId: 102,
        taskTitle: 'Database Migration',
        userId: 3,
        category: 'access',
        description: 'Need production DB access to run migration scripts',
        status: 'resolved',
        createdAt: '2026-02-05T11:30:00',
        resolvedAt: '2026-02-06T14:00:00',
    },
];

// Task feedback (difficulty + time estimation)
export const TASK_FEEDBACK = [
    {
        id: 1,
        taskId: 100,
        taskTitle: 'Dashboard Redesign',
        userId: 3,
        difficultyRating: 4, // 1-5
        estimatedHours: 8,
        actualHours: 12,
        feedback: 'The CSS animations were more complex than anticipated.',
        submittedAt: '2026-02-07T18:00:00',
    },
    {
        id: 2,
        taskId: 99,
        taskTitle: 'Fix Login Bug',
        userId: 3,
        difficultyRating: 2,
        estimatedHours: 2,
        actualHours: 1.5,
        feedback: 'Straightforward fix once root cause identified.',
        submittedAt: '2026-02-06T12:30:00',
    },
];

// Analytics aggregates for Admin/Manager
export const ANALYTICS_AGGREGATES = {
    skills: {
        topSkills: [
            { name: 'React', avgRating: 4.2, employees: 15 },
            { name: 'Communication', avgRating: 4.0, employees: 20 },
            { name: 'JavaScript', avgRating: 3.9, employees: 18 },
        ],
        skillGaps: [
            { name: 'Python', avgRating: 2.1, gapCount: 12 },
            { name: 'Leadership', avgRating: 2.5, gapCount: 8 },
            { name: 'Project Management', avgRating: 2.8, gapCount: 6 },
        ],
        trainingRequests: { pending: 5, approved: 12, completed: 8 },
    },
    blockers: {
        activeCount: 8,
        resolvedThisWeek: 12,
        avgResolutionTime: 18, // hours
        byCategory: {
            waiting: 4,
            unclear: 3,
            technical: 5,
            access: 2,
        },
    },
    estimation: {
        avgAccuracy: 78, // percentage
        overEstimated: 25,
        underEstimated: 40,
        accurate: 35, // within 10%
        avgDifficultyRating: 3.2,
    },
};
