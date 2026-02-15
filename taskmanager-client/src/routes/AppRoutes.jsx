import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RoleBasedRedirect from '../components/auth/RoleBasedRedirect';

// Dashboard
import DashboardPage from '../pages/DashboardPage';

// Admin
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import AuditLogPage from '../pages/admin/AuditLogPage';
import SystemHealthPage from '../pages/admin/SystemHealthPage';
import EmployeeInsightsPage from '../pages/admin/EmployeeInsightsPage';

// Teams
import TeamsPage from '../pages/teams/TeamsPage';
import TeamDetailPage from '../pages/teams/TeamDetailPage';
import TeamsHierarchyPage from '../pages/teams/TeamsHierarchyPage';

// Tasks
import TasksPage from '../pages/tasks/TasksPage';
import TaskDetailPage from '../pages/tasks/TaskDetailPage';

// Worklogs
import TimeLoggingPage from '../pages/worklogs/TimeLoggingPage';

// Analytics
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';

// Workload
import WorkloadPage from '../pages/workload/WorkloadPage';

// Manager
import ManagerSearchPage from '../pages/manager/ManagerSearchPage';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import MyTeamPage from '../pages/manager/MyTeamPage';
import ApprovalQueue from '../pages/manager/ApprovalQueue';
import TeamPulse from '../pages/manager/TeamPulse';

// Team Lead
import TeamLeadDashboard from '../pages/teamlead/TeamLeadDashboard';

// Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyTasksPage from '../pages/employee/MyTasksPage';
import FocusMode from '../pages/employee/FocusMode';
import DailyGoalsPage from '../pages/employee/DailyGoalsPage';
import SkillProgressPage from '../pages/employee/SkillProgressPage';
import PeerRecognitionPage from '../pages/employee/PeerRecognitionPage';
import WeeklyReflectionPage from '../pages/employee/WeeklyReflectionPage';

// HR
import HRDashboard from '../pages/hr/HRDashboard';
import HREmployeesPage from '../pages/hr/HREmployeesPage';
import HRAnalyticsPage from '../pages/hr/HRAnalyticsPage';
import HRTeamsPage from '../pages/hr/HRTeamsPage';
import HRTimeLogsPage from '../pages/hr/HRTimeLogsPage';

// Gamification
import LeaderboardPage from '../pages/LeaderboardPage';
import AchievementsPage from '../pages/AchievementsPage';

// Settings
import SettingsPage from '../pages/SettingsPage';

// 404
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* All pages inside DashboardLayout - protected by role */}
      <Route element={<DashboardLayout />}>

        {/* ─── Admin-Only Routes ──────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/roles" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <RoleManagement />
          </ProtectedRoute>
        } />
        <Route path="/audit-log" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AuditLogPage />
          </ProtectedRoute>
        } />
        <Route path="/system-health" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <SystemHealthPage />
          </ProtectedRoute>
        } />
        <Route path="/employee-insights" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <EmployeeInsightsPage />
          </ProtectedRoute>
        } />

        {/* ─── Teams (Admin, Manager, TeamLead, HR) ──── */}
        <Route path="/teams" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead', 'HR']}>
            <TeamsPage />
          </ProtectedRoute>
        } />
        <Route path="/teams/hierarchy" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead', 'HR']}>
            <TeamsHierarchyPage />
          </ProtectedRoute>
        } />
        <Route path="/teams/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead', 'HR']}>
            <TeamDetailPage />
          </ProtectedRoute>
        } />

        {/* ─── Tasks (Admin, Manager, TeamLead) ──────── */}
        <Route path="/tasks" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <TasksPage />
          </ProtectedRoute>
        } />
        <Route path="/tasks/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <TaskDetailPage />
          </ProtectedRoute>
        } />

        {/* ─── Analytics (Admin, Manager, HR) ────────── */}
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'HR']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />

        {/* ─── Workload (Admin, Manager) ─────────────── */}
        <Route path="/workload" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <WorkloadPage />
          </ProtectedRoute>
        } />

        {/* ─── Manager Routes ────────────────────────── */}
        <Route path="/manager/search" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <ManagerSearchPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* ─── Team Lead Routes ──────────────────────── */}
        <Route path="/teamlead/dashboard" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <TeamLeadDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/team" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <MyTeamPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/team" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <MyTeamPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/approvals" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <ApprovalQueue />
          </ProtectedRoute>
        } />
        <Route path="/manager/pulse" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <TeamPulse />
          </ProtectedRoute>
        } />

        {/* ─── Employee Routes (all authenticated) ───── */}
        <Route path="/employee/dashboard" element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/tasks" element={
          <ProtectedRoute>
            <MyTasksPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/focus" element={
          <ProtectedRoute>
            <FocusMode />
          </ProtectedRoute>
        } />
        <Route path="/employee/goals" element={
          <ProtectedRoute>
            <DailyGoalsPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/time-logs" element={
          <ProtectedRoute>
            <TimeLoggingPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/skills" element={
          <ProtectedRoute>
            <SkillProgressPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/recognition" element={
          <ProtectedRoute>
            <PeerRecognitionPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/reflection" element={
          <ProtectedRoute>
            <WeeklyReflectionPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/achievements" element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        } />

        {/* ─── HR Routes ─────────────────────────────── */}
        <Route path="/hr/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <HRDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hr/employees" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <HREmployeesPage />
          </ProtectedRoute>
        } />
        <Route path="/hr/teams" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <HRTeamsPage />
          </ProtectedRoute>
        } />
        <Route path="/hr/time-logs" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <HRTimeLogsPage />
          </ProtectedRoute>
        } />
        <Route path="/hr/analytics" element={
          <ProtectedRoute allowedRoles={['Admin', 'HR']}>
            <HRAnalyticsPage />
          </ProtectedRoute>
        } />

        {/* ─── Shared (all authenticated) ────────────── */}
        <Route path="/time-logs" element={
          <ProtectedRoute>
            <TimeLoggingPage />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
