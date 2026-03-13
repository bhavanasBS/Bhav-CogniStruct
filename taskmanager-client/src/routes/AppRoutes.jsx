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
import ManagerProjectsPage from '../pages/manager/ManagerProjectsPage';
import MyTeamPage from '../pages/manager/MyTeamPage';
import ApprovalQueue from '../pages/manager/ApprovalQueue';
import ManagerTimeLogsPage from '../pages/manager/ManagerTimeLogsPage';
import ManagerReviewPage from '../pages/manager/ManagerReviewPage';
import ManagerProjectDetailPage from '../pages/manager/ManagerProjectDetailPage';

// Team Lead
import TeamLeadDashboard from '../pages/teamlead/TeamLeadDashboard';
import TeamLeadTimeLogsPage from '../pages/teamlead/TeamLeadTimeLogsPage';
import TeamLeadTeamPage from '../pages/teamlead/TeamLeadTeamPage';
import MyProjectsPage from '../pages/teamlead/MyProjectsPage';
import ProjectDetailPage from '../pages/teamlead/ProjectDetailPage';
import PauseRequestsPage from '../pages/teamlead/PauseRequestsPage';

// Employee
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyTasksPage from '../pages/employee/MyTasksPage';
import SkillProgressPage from '../pages/employee/SkillProgressPage';
import EmployeeReviewsPage from '../pages/employee/EmployeeReviewsPage';
import EmployeeProgressPage from '../pages/employee/EmployeeProgressPage';




// Profile
import MyProfilePage from '../pages/MyProfilePage';
import PublicProfilePage from '../pages/PublicProfilePage';

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
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <TeamsPage />
          </ProtectedRoute>
        } />

        <Route path="/teams/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
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
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead', 'Employee']}>
            <TaskDetailPage />
          </ProtectedRoute>
        } />

        {/* ─── Analytics (Admin, Manager) ────────── */}
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
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
        <Route path="/manager/projects" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <ManagerProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/projects/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <ManagerProjectDetailPage />
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
            <TeamLeadTeamPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/tasks" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <TasksPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/projects" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <MyProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/projects/:id" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <ProjectDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/time-logs" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <TeamLeadTimeLogsPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/workload" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <WorkloadPage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/pause-requests" element={
          <ProtectedRoute allowedRoles={['TeamLead', 'Team Lead']}>
            <PauseRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/team" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <MyTeamPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/tasks" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <TasksPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/approvals" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'TeamLead', 'Team Lead']}>
            <ApprovalQueue />
          </ProtectedRoute>
        } />
        <Route path="/manager/time-logs" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <ManagerTimeLogsPage />
          </ProtectedRoute>
        } />
        <Route path="/manager/analytics" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/reviews" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <ManagerReviewPage />
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
        <Route path="/employee/reviews" element={
          <ProtectedRoute>
            <EmployeeReviewsPage />
          </ProtectedRoute>
        } />
        <Route path="/employee/progress" element={
          <ProtectedRoute>
            <EmployeeProgressPage />
          </ProtectedRoute>
        } />

        {/* ─── Shared (all authenticated) ────────────── */}
        <Route path="/time-logs" element={
          <ProtectedRoute>
            <TimeLoggingPage />
          </ProtectedRoute>
        } />

        {/* ─── Role-Based Profile Routes ──────────────── */}
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MyProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/manager/profile" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <MyProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/teamlead/profile" element={
          <ProtectedRoute allowedRoles={['Admin', 'TeamLead', 'Team Lead']}>
            <MyProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/employee/profile" element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/view-profile/:userId" element={
          <ProtectedRoute>
            <PublicProfilePage />
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
