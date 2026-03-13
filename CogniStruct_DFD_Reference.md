# CogniStruct — Complete Process & Data Flow Reference

> **Purpose:** This document lists every process, external entity, data store, and data flow in the CogniStruct Task Management System to help you draw a Data Flow Diagram (DFD).

---

## 1. External Entities (Actors)

| # | Entity | Description |
|---|--------|-------------|
| E1 | **Admin** | Full system control — user CRUD, role assignment, system configuration, team management |
| E2 | **Manager** | Team management, task assignment, project management, analytics, approvals, reviews |
| E3 | **Team Lead** | Assign tasks within team, manage projects, view team progress, handle pause requests |
| E4 | **Employee** | View assigned tasks, log work hours, update task status, track skills & progress |

---

## 2. Data Stores

| # | Data Store | Model/Table | Key Fields |
|---|-----------|-------------|------------|
| D1 | **Users** | [User](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-client/src/components/users/UserForm.jsx#6-262) | UserId, FirstName, LastName, Email, PasswordHash, IsActive, ManagerId, CreatedDate |
| D2 | **Roles** | [Role](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-client/src/components/users/UserForm.jsx#44-48) | RoleId, RoleName |
| D3 | **UserRoles** | `UserRole` | UserId, RoleId (junction table) |
| D4 | **Teams** | [Team](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-client/src/components/teams/TeamForm.jsx#7-100) | TeamId, TeamName, Description, ManagerId, IsActive, CreatedDate |
| D5 | **TeamMembers** | `TeamMember` | TeamId, UserId, JoinedDate (junction table) |
| D6 | **Tasks** | [TaskItem](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-server/Models/TaskItem.cs#9-70) | TaskId, Title, Description, AssigneeId, AssignerId, TeamId, Priority (0–3), Status (0–6), Deadline, EstimatedHours, CreatedDate, UpdatedDate, CompletedDate, StartedAt, PausedAt, PauseReason, SlaHours, SlaBreached, RequiredSkills, ParentTaskId |
| D7 | **WorkLogs** | [WorkLog](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-client/src/pages/tasks/TaskDetailPage.jsx#101-109) | WorkLogId, TaskId, UserId, HoursWorked, LogDate, Description |
| D8 | **TaskAuditLogs** | `TaskAuditLog` | LogId, TaskId, Action, OldValue, NewValue, ChangedByUserId, Timestamp |
| D9 | **TaskComments** | `TaskComment` | CommentId, TaskId, UserId, Content, CreatedDate |
| D10 | **TaskAttachments** | `TaskAttachment` | AttachmentId, TaskId, FileName, FilePath, UploadedByUserId, UploadDate |
| D11 | **TaskFeedback** | [TaskFeedback](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-server/Controllers/TaskFeedbackController.cs#16-17) | FeedbackId, TaskId, Rating, Comment, GivenByUserId, CreatedDate |
| D12 | **PauseRequests** | [PauseRequest](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-server/Services/NotificationService.cs#46-50) | RequestId, TaskId, RequestedByUserId, Reason, Status, ApprovedByUserId, CreatedDate |
| D13 | **Notifications** | [Notification](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-server/Models/Notification.cs#5-28) | Id, UserId, Type, Title, Message, IsRead, CreatedDate |
| D14 | **EmployeeReviews** | [EmployeeReview](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-server/Controllers/EmployeeReviewsController.cs#9-182) | ReviewId, EmployeeId, ReviewerId, Rating, Comments, ReviewDate |
| D15 | **SkillUsages** | `SkillUsage` | Id, UserId, SkillName, UsageCount, LastUsedDate |
| D16 | **UserSettings** | `UserSettings` | Id, UserId, SettingKey, SettingValue |
| D17 | **TrainingRequests** | `TrainingRequest` | Id, UserId, SkillName, Status, RequestDate |

---

## 3. All Processes (Grouped by Module)

### 3.1 Authentication & Authorization Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P1.1 | **User Login** | Authenticate user with email & password, return JWT token | Email, Password | JWT Token, User data, Role | `POST /api/auth/login` |
| P1.2 | **User Registration** | Register a new user account | FirstName, LastName, Email, Password | User record created | `POST /api/auth/register` |
| P1.3 | **Role-Based Redirect** | After login, redirect user to their role-specific dashboard | JWT Token (role claim) | Redirect to `/dashboard`, `/manager/dashboard`, `/teamlead/dashboard`, or `/employee/dashboard` | Frontend logic |
| P1.4 | **Route Protection** | Verify JWT and role before allowing page access | JWT Token, Required Roles | Allow/Deny access | Frontend [ProtectedRoute](file:///c:/CogniStruct/New-CogniStruct-Task-Assign-main/New-CogniStruct-Task-Assign-main/taskmanager-client/src/components/auth/ProtectedRoute.jsx#4-57) component |

---

### 3.2 User Management Module (Admin)

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P2.1 | **List All Users** | Get paginated list of all users with filters (active/inactive/unassigned) | Filters, Search query | User list with roles | `GET /api/users` |
| P2.2 | **Get User Details** | Retrieve single user by ID | UserId | User details + roles | `GET /api/users/{id}` |
| P2.3 | **Create User** | Admin creates a new user | FirstName, LastName, Email, Password, Role | New user record | `POST /api/users` |
| P2.4 | **Update User** | Edit user's basic info | UserId, Updated fields | Updated user record | `PUT /api/users/{id}` |
| P2.5 | **Toggle User Status** | Activate or deactivate a user | UserId, IsActive flag | Updated status | `PATCH /api/users/{id}/status` |
| P2.6 | **Assign Roles** | Assign/change roles for a user | UserId, RoleIds | Updated UserRoles | `PUT /api/users/{id}/roles` |
| P2.7 | **Delete User** | Permanently remove a user | UserId | User deleted | `DELETE /api/users/{id}` |
| P2.8 | **Assign Manager** | Assign a manager to an employee | UserId, ManagerId | Updated ManagerId | `PUT /api/users/{id}/assign-manager` |
| P2.9 | **List My Employees** | Manager gets list of their direct reports | Manager's JWT | Employee list | `GET /api/users/my-employees` |
| P2.10 | **List All Employees** | Get all users with Employee role | Filters | Employee list | `GET /api/users/employees` |
| P2.11 | **Get Current User** | Get logged-in user's own profile | JWT | User profile | `GET /api/users/me` |
| P2.12 | **Upload Avatar** | Upload profile picture | Image file | Avatar URL | `POST /api/users/me/avatar` |

---

### 3.3 Team Management Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P3.1 | **List All Teams** | Get all teams with member counts | — | Team list | `GET /api/teams` |
| P3.2 | **Get My Team** | Manager/TeamLead gets their own team | JWT | Team details | `GET /api/teams/my-team` |
| P3.3 | **Get Team Details** | Get single team by ID with members | TeamId | Team + Members | `GET /api/teams/{id}` |
| P3.4 | **Create Team** | Admin/Manager creates a new team | TeamName, Description, ManagerId | New team record | `POST /api/teams` |
| P3.5 | **Update Team** | Edit team name, description, manager | TeamId, Updated fields | Updated team | `PUT /api/teams/{id}` |
| P3.6 | **Delete Team** | Admin deletes a team (removes members, unlinks tasks) | TeamId | Team deleted | `DELETE /api/teams/{id}` |
| P3.7 | **List Team Members** | Get members of a specific team | TeamId | Member list | `GET /api/teams/{teamId}/members` |
| P3.8 | **Add Team Member** | Add an employee to a team | TeamId, UserId | TeamMember created | `POST /api/teams/{teamId}/members` |
| P3.9 | **Remove Team Member** | Remove a member from a team | TeamId, UserId | TeamMember removed | `DELETE /api/teams/{teamId}/members/{userId}` |
| P3.10 | **Search Managers** | Search for users with Manager role (for team creation) | Search query | Manager list | `GET /api/teams/manager-search` |
| P3.11 | **Get Available Users** | Get users not yet in a specific team | TeamId, Search query | Available user list | `GET /api/teams/{teamId}/available-users` |

---

### 3.4 Task Management Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P4.1 | **List Tasks** | Get all tasks with filters (status, priority, date range, search) | Filters | Task list | `GET /api/tasks` |
| P4.2 | **Get Task Details** | Get single task with assignee, comments, work logs | TaskId | Full task details | `GET /api/tasks/{id}` |
| P4.3 | **Create Task** | Manager/TeamLead creates and assigns a task | Title, Description, AssigneeId, TeamId, Priority, Deadline, EstimatedHours, RequiredSkills, SlaHours | New task + Notification to assignee | `POST /api/tasks` |
| P4.4 | **Update Task Status** | Change task status (Pending→InProgress→Completed, etc.) | TaskId, NewStatus | Updated task + Audit log + Notification | `PATCH /api/tasks/{id}/status` |
| P4.5 | **Cancel Task** | Cancel a task | TaskId | Cancelled task + Notification | `PATCH /api/tasks/{id}/cancel` |
| P4.6 | **Delete Task** | Permanently remove a task | TaskId | Task deleted | `DELETE /api/tasks/{id}` |
| P4.7 | **Pause Task** | Pause a task with reason (requires approval for Employee) | TaskId, PauseReason | Paused task or PauseRequest created | `PATCH /api/tasks/{id}/pause` |
| P4.8 | **Resume Task** | Resume a paused task | TaskId | Resumed task | `PATCH /api/tasks/{id}/resume` |
| P4.9 | **Reassign Task** | Reassign task to different employee | TaskId, NewAssigneeId, Reason | Updated assignment + Audit log + Notifications | `PATCH /api/tasks/{id}/reassign` |
| P4.10 | **Get Employee Tasks** | Get all tasks assigned to a specific employee | EmployeeId | Task list | `GET /api/tasks/employee/{employeeId}` |
| P4.11 | **Get Manager Tasks** | Get all tasks created by a specific manager | ManagerId | Task list | `GET /api/tasks/manager/{managerId}` |
| P4.12 | **Get Eligible Assignees** | Get employees who can be assigned a specific task | TaskId | Employee list | `GET /api/tasks/{id}/eligible-assignees` |

---

### 3.5 Project Management Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P5.1 | **Create Project** | Create a project (parent task with subtasks) | Title, Description, AssigneeId, Subtasks array | Project task + Subtasks | `POST /api/tasks` (with subtasks) |
| P5.2 | **Update Project** | Update project details and subtasks | ProjectId, Updated fields | Updated project | `PATCH /api/tasks/projects/{id}` |
| P5.3 | **Update Subtask** | Update individual subtask within a project | SubtaskId, Updated fields | Updated subtask | `PATCH /api/tasks/subtasks/{id}` |
| P5.4 | **View Project Details** | Get project with all subtasks and progress | ProjectId | Project + Subtasks + Progress % | `GET /api/tasks/{id}` |

---

### 3.6 Work Logging Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P6.1 | **Log Work Hours** | Employee logs hours against a task | TaskId, HoursWorked, LogDate, Description | WorkLog created | `POST /api/worklogs` |
| P6.2 | **Get Task Work Logs** | Get all work logs for a specific task | TaskId | WorkLog list | `GET /api/worklogs/task/{taskId}` |
| P6.3 | **Get Employee Work Logs** | Get all work logs by an employee | UserId | WorkLog list | `GET /api/worklogs/employee/{userId}` |
| P6.4 | **Get Team Work Logs** | Manager views all work logs for their team | UserId (manager) | Team WorkLog list | `GET /api/worklogs/team/{userId}` |
| P6.5 | **Get Employee Summary** | Get work log summary (total hours, days logged) | UserId | Summary stats | `GET /api/worklogs/employee/{userId}/summary` |
| P6.6 | **Get Weekly Report** | Get week-by-week work log breakdown | UserId | Weekly breakdown | `GET /api/worklogs/employee/{userId}/weekly` |
| P6.7 | **Edit Work Log** | Update an existing work log entry | WorkLogId, Updated fields | Updated work log | `PUT /api/worklogs/{id}` |
| P6.8 | **Delete Work Log** | Remove a work log entry | WorkLogId | Work log deleted | `DELETE /api/worklogs/{id}` |

---

### 3.7 Pause Request & Approval Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P7.1 | **Submit Pause Request** | Employee requests to pause a task (auto-created when employee pauses) | TaskId, Reason | PauseRequest created + Notification to manager | `PATCH /api/tasks/{id}/pause` |
| P7.2 | **List Pause Requests** | Manager/TeamLead views pending pause requests | Filters | PauseRequest list | `GET /api/pause-requests` |
| P7.3 | **Approve Pause Request** | Manager/TeamLead approves a pause request | RequestId | Task paused + Notification to employee | `PATCH /api/pause-requests/{id}/approve` |
| P7.4 | **Reject Pause Request** | Manager/TeamLead rejects a pause request | RequestId | Request rejected + Notification to employee | `PATCH /api/pause-requests/{id}/reject` |
| P7.5 | **Approval Queue** | Manager views all pending approvals | Manager JWT | Pending tasks/requests | Frontend page `/manager/approvals` |

---

### 3.8 Analytics & Reporting Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P8.1 | **Task Completion Rate** | Calculate overall task completion percentage | Date range | Completion rate % | `GET /api/analytics/completion-rate` |
| P8.2 | **Average Completion Time** | Calculate average time to complete tasks | Date range | Avg hours | `GET /api/analytics/avg-completion-time` |
| P8.3 | **Productivity Scores** | Calculate productivity scores per employee | — | Employee productivity list | `GET /api/analytics/productivity-scores` |
| P8.4 | **Team Comparison** | Compare performance across teams | — | Team stats comparison | `GET /api/analytics/team-comparison` |
| P8.5 | **Weekly Productivity** | Get week-by-week productivity for an employee | UserId | Weekly metrics | `GET /api/analytics/weekly-productivity/{userId}` |
| P8.6 | **Top Performers** | Get top 5 employees by performance this week | — | Top performers list | `GET /api/analytics/top-performers` |
| P8.7 | **Employee Productivity Report** | Get productivity metrics for all team employees | — | Productivity table | `GET /api/analytics/employee-productivity` |

---

### 3.9 Employee Review Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P9.1 | **Create Review** | Manager writes a performance review for an employee | EmployeeId, Rating, Comments | Review created + Notification | `POST /api/employee-reviews` |
| P9.2 | **Get Employee Reviews** | Get all reviews for a specific employee | EmployeeId | Review list | `GET /api/employee-reviews/employee/{employeeId}` |
| P9.3 | **Get Manager's Reviews** | Get all reviews written by a manager | ManagerId (JWT) | Review list | `GET /api/employee-reviews/manager` |
| P9.4 | **Update Review** | Edit an existing review | ReviewId, Updated fields | Updated review | `PUT /api/employee-reviews/{id}` |
| P9.5 | **Delete Review** | Remove a review | ReviewId | Review deleted | `DELETE /api/employee-reviews/{id}` |

---

### 3.10 Notification Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P10.1 | **Send Notification** | System sends a notification to a user (triggered by task events) | UserId, Type, Title, Message | Notification created | Internal (triggered by other processes) |
| P10.2 | **Get My Notifications** | User retrieves their notifications | JWT | Notification list | `GET /api/notifications` |
| P10.3 | **Mark Notification Read** | Mark a single notification as read | NotificationId | Updated notification | `PATCH /api/notifications/{id}/read` |
| P10.4 | **Mark All Read** | Mark all notifications as read | JWT | All updated | `PATCH /api/notifications/read-all` |

---

### 3.11 Task Comments Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P11.1 | **Add Comment** | Add a comment to a task | TaskId, Content | Comment created | `POST /api/tasks/{taskId}/comments` |
| P11.2 | **Get Comments** | Get all comments on a task | TaskId | Comment list | `GET /api/tasks/{taskId}/comments` |

---

### 3.12 Task Attachments Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P12.1 | **Upload Attachment** | Upload a file to a task | TaskId, File | Attachment record | `POST /api/tasks/{taskId}/attachments` |
| P12.2 | **Get Attachments** | List attachments for a task | TaskId | Attachment list | `GET /api/tasks/{taskId}/attachments` |
| P12.3 | **Delete Attachment** | Remove an attachment | AttachmentId | Attachment deleted | `DELETE /api/attachments/{id}` |

---

### 3.13 Task Feedback Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P13.1 | **Give Feedback** | Manager gives feedback/rating on a completed task | TaskId, Rating, Comment | Feedback created | `POST /api/tasks/{taskId}/feedback` |
| P13.2 | **Get Task Feedback** | Get feedback for a task | TaskId | Feedback list | `GET /api/tasks/{taskId}/feedback` |

---

### 3.14 Workload Management Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P14.1 | **Get Team Workload** | View workload distribution for a team | TeamId | Per-employee task counts & hours | `GET /api/workload/team/{teamId}` |
| P14.2 | **Get All Workloads** | View workloads across all teams | — | All team workloads | `GET /api/workload/all` |
| P14.3 | **Get Employee Workload** | View specific employee's workload breakdown | UserId | Task distribution | `GET /api/workload/employee/{userId}` |
| P14.4 | **AI Recommend Assignee** | AI suggests best employee for a task based on workload & skills | TeamId | Recommended employee list | `GET /api/workload/recommend/{teamId}` |
| P14.5 | **Project Health Score** | Calculate health score for a project | ProjectId | Health metrics | `GET /api/workload/project-health/{projectId}` |

---

### 3.15 Skill Analytics Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P15.1 | **Get Skill Progress** | Get an employee's skill usage statistics | UserId | Skill usage list | `GET /api/skill-analytics/user/{userId}` |
| P15.2 | **Get Team Skills** | Get skill distribution across a team | TeamId | Team skill matrix | `GET /api/skill-analytics/team/{teamId}` |

---

### 3.16 Employee Progress Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P16.1 | **Get My Progress** | Employee views their overall progress and statistics | UserId (JWT) | Progress stats (tasks completed, hours logged, on-time rate) | `GET /api/employee-progress/my-progress` |

---

### 3.17 Profile & Settings Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P17.1 | **View My Profile** | User views their own profile | JWT | Profile data | `GET /api/profile/me` |
| P17.2 | **Update My Profile** | User updates bio, interests, skills, etc. | Updated fields | Updated profile | `PUT /api/profile/me` |
| P17.3 | **View Public Profile** | View another user's public profile | UserId | Public profile data | `GET /api/profile/{userId}` |
| P17.4 | **Get Settings** | Get user's app settings | JWT | Settings key-value pairs | `GET /api/settings` |
| P17.5 | **Update Settings** | Save user settings (theme, notifications, etc.) | Settings data | Updated settings | `PUT /api/settings` |

---

### 3.18 Admin System Module

| # | Process | Description | Input | Output | API Endpoint |
|---|---------|-------------|-------|--------|-------------|
| P18.1 | **Admin Dashboard** | View system-wide statistics (total users, tasks, teams) | — | Dashboard counters | Frontend `/dashboard` |
| P18.2 | **Audit Log** | View system activity log | Filters | Audit entries | Frontend `/audit-log` (uses TaskAuditLog) |
| P18.3 | **System Health** | View system status (server, DB, memory) | — | Health metrics | Frontend `/system-health` |
| P18.4 | **Employee Insights** | View AI-powered employee analytics | — | Employee insights | Frontend `/employee-insights` |

---

## 4. Data Flows Summary (Process ↔ Data Store interaction)

| Data Flow | From/To | Description |
|-----------|---------|-------------|
| Login credentials → D1 | E1–E4 → Users | Verify email/password, return JWT |
| User CRUD → D1, D3 | Admin → Users, UserRoles | Create/read/update/delete users |
| Team CRUD → D4, D5 | Admin/Manager → Teams, TeamMembers | Create/update/delete teams and memberships |
| Task CRUD → D6 | Manager/TeamLead → Tasks | Create/assign/update/delete tasks |
| Status change → D6, D8, D13 | Any role → Tasks, AuditLog, Notifications | Update status, log audit trail, send notification |
| Pause flow → D6, D12, D13 | Employee → Tasks, PauseRequests, Notifications | Request pause → Manager reviews → Approve/Reject |
| Work log → D7 | Employee → WorkLogs | Log hours against a task |
| Comments → D9 | Any role → TaskComments | Add/view comments on tasks |
| Attachments → D10 | Any role → TaskAttachments | Upload/download files on tasks |
| Feedback → D11 | Manager → TaskFeedback | Rate/comment on completed tasks |
| Reviews → D14 | Manager → EmployeeReviews | Write performance reviews for employees |
| Skills tracking → D15 | System → SkillUsages | Auto-tracked from task RequiredSkills |
| Notifications → D13 | System → Notifications | Auto-generated on task events |
| Settings → D16 | Any role → UserSettings | Save/load user preferences |
| Analytics → D6, D7 | Manager → Tasks, WorkLogs | Calculate metrics from task/worklog data |

---

## 5. Notification Trigger Events

| Event | Notification Type | Recipient |
|-------|------------------|-----------|
| Task assigned to employee | `task_assigned` | Assignee |
| Task completed | `task_completed` | Assigner/Manager |
| Task paused | `task_paused` | Manager/TeamLead |
| Task resumed | `task_resumed` | Manager/TeamLead |
| Task cancelled | `task_cancelled` | Assignee |
| Task reassigned | `task_reassigned` | Old Assignee + New Assignee |
| Pause request submitted | `pause_request` | Manager/TeamLead |
| Pause approved | `pause_approved` | Requester |
| Pause rejected | `pause_rejected` | Requester |
| SLA breached | `sla_breached` | Assigner/Manager |
| Feedback received | `feedback_received` | Task assignee |
| Deadline reminder | `deadline_reminder` | Assignee |
| Task overdue | `task_overdue` | Assignee + Manager |
| Project assigned | `project_assigned` | Team Lead |

---

## 6. Role-Based Access Matrix

| Feature | Admin | Manager | Team Lead | Employee |
|---------|:-----:|:-------:|:---------:|:--------:|
| User Management (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Role Assignment | ✅ | ❌ | ❌ | ❌ |
| Team CRUD | ✅ | ✅ (own) | ❌ | ❌ |
| Team Members Add/Remove | ✅ | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ❌ |
| View All Tasks | ✅ | ✅ (team) | ✅ (team) | ❌ |
| View Own Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ (own) |
| Pause Task (direct) | ✅ | ✅ | ✅ | ❌ (needs approval) |
| Approve Pause Requests | ❌ | ✅ | ✅ | ❌ |
| Log Work Hours | ❌ | ❌ | ❌ | ✅ |
| View Team Work Logs | ❌ | ✅ | ✅ | ❌ |
| Create Projects | ❌ | ✅ | ❌ | ❌ |
| Manage Projects | ❌ | ✅ | ✅ (assigned) | ❌ |
| Analytics Dashboard | ✅ | ✅ | ❌ | ❌ |
| Workload View | ✅ | ✅ | ✅ | ❌ |
| Performance Reviews | ❌ | ✅ | ❌ | ✅ (view own) |
| Skill Progress | ❌ | ❌ | ❌ | ✅ |
| My Progress | ❌ | ❌ | ❌ | ✅ |
| Profile (own) | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ❌ | ❌ | ❌ |
| System Health | ✅ | ❌ | ❌ | ❌ |

---

## 7. Task Status Flow (State Machine)

```
Pending (0) → InProgress (2) → Completed (3)
                ↕                    
              Paused (4)           
                ↕                    
            InProgress (2)         
                                     
Any Status → Cancelled (6)
```

**Status Codes:**
- `0` = Pending
- `1` = Assigned
- `2` = InProgress
- `3` = Completed
- `4` = Paused
- `5` = Blocked
- `6` = Cancelled

---

## 8. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router, Axios, Lucide React icons, react-hot-toast |
| **Backend** | ASP.NET Core 9, Entity Framework Core |
| **Database** | SQLite (dev) / SQL Server (prod) |
| **Auth** | JWT Bearer Tokens |
| **Styling** | Tailwind CSS |

---

## 9. High-Level Context Diagram (Level 0)

```
┌──────────┐                                          ┌──────────┐
│  Admin   │──── User/Team/Role Management ──────────▶│          │
└──────────┘                                          │          │
┌──────────┐                                          │          │
│ Manager  │──── Task/Project/Review/Analytics ──────▶│CogniStruct│
└──────────┘                                          │  System  │
┌──────────┐                                          │          │
│Team Lead │──── Task/Project/Pause Approval ────────▶│          │
└──────────┘                                          │          │
┌──────────┐                                          │          │
│ Employee │──── Work Logs/Status/Skills ────────────▶│          │
└──────────┘                                          └──────────┘
```

---

*Document generated: March 12, 2026*
*Project: CogniStruct Task Management Platform*
