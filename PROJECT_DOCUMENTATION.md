# CogniStruct — AI-Enabled Workforce Orchestration & Productivity Intelligence Platform

## Complete Project Documentation

---

## Table of Contents

1. [Project Abstract](#1-project-abstract)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Design](#4-database-design)
5. [Backend — ASP.NET Core Web API](#5-backend--aspnet-core-web-api)
6. [Frontend — React + Vite SPA](#6-frontend--react--vite-spa)
7. [Module Breakdown](#7-module-breakdown)
8. [Application Workflow](#8-application-workflow)
9. [API Endpoint Catalog](#9-api-endpoint-catalog)
10. [Security & Authentication](#10-security--authentication)
11. [Routing & Navigation](#11-routing--navigation)
12. [Current Build Status](#12-current-build-status)
13. [How to Run](#13-how-to-run)

---

## 1. Project Abstract

**CogniStruct** is an enterprise-grade, AI-enabled Workforce Orchestration and Productivity Intelligence Platform. It is a full-stack web application designed to help organizations manage employees, teams, tasks, time logs, workload balancing, and performance analytics — all within a hierarchical reporting structure.

### What It Does

- **Multi-Role Workforce Management**: Supports five distinct user roles — **Admin**, **Manager**, **Team Lead**, **Employee**, and **HR** — each with tailored dashboards, permissions, and functionality.
- **Team & Hierarchy Management**: Organizes employees into teams with a recursive manager→employee hierarchy. Supports team creation, member management, and visual hierarchy trees.
- **Task Assignment & Tracking**: Full lifecycle task management — create, assign, track status (Pending → In Progress → Completed → Overdue), set priorities (Low/Medium/High), deadlines, and estimated hours.
- **Time Tracking & Work Logs**: Employees log work hours against tasks. Managers and HR can view team-wide time data with summaries and weekly breakdowns.
- **Performance Analytics**: Rich analytics dashboards with charts for task completion rates, productivity scores, team comparisons, weekly trends, and status breakdowns.
- **Intelligent Workload Balancing**: Recommends the best employee to assign a task to, based on their current workload percentage (active tasks hours vs. max capacity).
- **Notifications & Reminders**: In-app notification system for task assignments, deadline reminders, and overdue alerts.
- **Gamification Features**: Leaderboards, achievements, peer recognition, daily goals, skill progress tracking, and weekly reflections for employees.
- **User Settings & Preferences**: Comprehensive settings page for profile, notifications, appearance, and security preferences.

### Key Differentiators

| Feature | Description |
|---------|-------------|
| **Role-Based Dashboards** | Each role (Admin, Manager, TeamLead, Employee, HR) sees a completely different dashboard tailored to their responsibilities |
| **Hierarchical Reporting** | Recursive manager→employee tree with visual org-chart rendering |
| **Workload Intelligence** | Algorithm that calculates employee workload percentages and recommends the least-loaded team member for new tasks |
| **Gamification Layer** | Unique employee engagement features — focus mode, daily goals, peer recognition, achievements, leaderboards |
| **Manager Team Pulse** | Real-time team health monitoring with sentiment tracking, task completion velocity, and engagement metrics |

---

## 2. Technology Stack

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | .NET | 9.0 |
| Framework | ASP.NET Core Web API | 9.0 |
| ORM | Entity Framework Core | 9.0.2 |
| Database | SQL Server | (LocalDB / Full) |
| Authentication | JWT Bearer Tokens | via `Microsoft.AspNetCore.Authentication.JwtBearer` 9.0.2 |
| Password Hashing | BCrypt | `BCrypt.Net-Next` 4.0.3 |
| API Documentation | Swagger / Swashbuckle | 6.9.0 |
| Serialization | System.Text.Json | Built-in (camelCase) |

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Library | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| CSS Framework | TailwindCSS | 4.1.18 |
| Routing | React Router DOM | 6.30.3 |
| HTTP Client | Axios | 1.13.5 |
| Charts | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 |
| Icons | Lucide React + React Icons | 0.563.0 / 5.5.0 |
| Notifications | react-hot-toast | 2.6.0 |
| Linting | ESLint | 9.39.1 |

---

## 3. Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   REACT FRONTEND (SPA)                    │
│   React 19 + Vite 7 + TailwindCSS 4 + Chart.js          │
│   Port: 5173 (dev)                                        │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP/HTTPS (JWT Bearer Token)
                        │ Axios with Interceptors
┌───────────────────────▼──────────────────────────────────┐
│              ASP.NET CORE 9 WEB API                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Controllers (11)                                   │  │
│  │  Auth, Users, Roles, Teams, Tasks, WorkLogs,       │  │
│  │  Analytics, Notifications, Managers, Workload,     │  │
│  │  Settings                                           │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Services (AuthService, JwtService)                │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Middleware (ErrorHandlingMiddleware)               │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Data Layer (AppDbContext + EF Core)                │  │
│  │  Models: User, Role, UserRole, Team, TeamMember,   │  │
│  │  TaskItem, WorkLog, Notification, UserSettings     │  │
│  └────────────────────────────────────────────────────┘  │
│  Port: 5000/5001                                          │
└───────────────────────┬──────────────────────────────────┘
                        │ Entity Framework Core
┌───────────────────────▼──────────────────────────────────┐
│                  SQL SERVER DATABASE                       │
│               CogniStructTaskDB                           │
└──────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client (Browser)
  → Axios HTTP Request (with JWT in Authorization header)
  → ASP.NET Core Middleware Pipeline:
      1. Error Handling Middleware
      2. CORS Policy ("AllowFrontend")
      3. JWT Authentication Middleware
      4. Authorization Check
  → Controller (route matching, model binding)
  → Service Layer (business logic)
  → EF Core DbContext (query/command)
  → SQL Server (execute)
  → Response flows back through layers
  → JSON Response to Client
```

### Design Patterns Used

| Pattern | Where It's Used |
|---------|----------------|
| MVC / API Controllers | All 11 controllers handle HTTP routing |
| Service Pattern | `AuthService` and `JwtService` encapsulate business logic |
| DbContext (Repository-like) | `AppDbContext` provides direct data access via EF Core |
| Middleware Pattern | `ErrorHandlingMiddleware` for global exception handling |
| Context API (React) | `AuthContext` and `NotificationContext` for state management |
| Protected Route Pattern | `ProtectedRoute` component for role-based page access |
| DTO Pattern | 8 DTO classes decouple API contracts from domain models |

---

## 4. Database Design

### Database Name: `CogniStructTaskDB`

The database is managed by Entity Framework Core with `Database.EnsureCreated()` and seeded by `DbSeeder.cs`.

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │──1:N──│  UserRoles   │──N:1──│    Roles     │
│              │       │              │       │              │
│ UserId (PK)  │       │ UserId (FK)  │       │ RoleId (PK)  │
│ FirstName    │       │ RoleId (FK)  │       │ RoleName     │
│ LastName     │       └──────────────┘       └──────────────┘
│ Email        │
│ PasswordHash │       ┌──────────────┐
│ IsActive     │──1:N──│ TeamMembers  │
│ MaxCapHours  │       │              │
│ CreatedDate  │       │ Id (PK)      │
│ ManagerId(FK)│──┐    │ TeamId (FK)  │──N:1──┌──────────────┐
└──────┬───────┘  │    │ UserId (FK)  │       │    Teams     │
       │          │    │ JoinedDate   │       │              │
       │ self-ref │    └──────────────┘       │ TeamId (PK)  │
       └──────────┘                           │ TeamName     │
                                              │ ManagerId(FK)│
┌──────────────┐                              │ CreatedDate  │
│    Tasks     │                              └──────────────┘
│ (TaskItem)   │
│ TaskId (PK)  │       ┌──────────────┐
│ Title        │──1:N──│  WorkLogs    │       ┌──────────────────┐
│ Description  │       │              │       │  UserSettings    │
│ AssignedTo   │       │ WorkLogId(PK)│       │                  │
│ AssignedBy   │       │ TaskId (FK)  │       │ Id (PK)          │
│ Priority     │       │ UserId (FK)  │       │ UserId (FK)      │
│ Deadline     │       │ StartTime    │       │ Theme, Language  │
│ EstHours     │       │ EndTime      │       │ Notifications    │
│ Status       │       │ TotalHours   │       │ Preferences      │
│ TeamId (FK)  │       │ Description  │       └──────────────────┘
│ CreatedDate  │       └──────────────┘
└──────────────┘
                ┌──────────────────┐
                │  Notifications   │
                │ NotifId (PK)     │
                │ UserId (FK)      │
                │ Title, Message   │
                │ Type, IsRead     │
                │ RelatedTaskId    │
                │ CreatedDate      │
                └──────────────────┘
```

### Tables (9 Models)

| # | Model | Description | Key Fields |
|---|-------|-------------|------------|
| 1 | `User` | All system users with self-referencing manager hierarchy | UserId, FirstName, LastName, Email, PasswordHash, IsActive, MaxCapacityHours, ManagerId |
| 2 | `Role` | System roles (Admin, Manager, Employee, TeamLead, HR) | RoleId, RoleName |
| 3 | `UserRole` | Many-to-many join between Users and Roles | UserId, RoleId |
| 4 | `Team` | Organizational teams headed by a manager | TeamId, TeamName, Description, ManagerId, IsActive |
| 5 | `TeamMember` | Many-to-many join between Teams and Users | Id, TeamId, UserId, JoinedDate, IsActive |
| 6 | `TaskItem` | Work tasks assigned to employees | TaskId, Title, Description, AssignedTo, AssignedBy, Priority, Deadline, EstimatedHours, Status, TeamId |
| 7 | `WorkLog` | Time entries logged against tasks | WorkLogId, TaskId, UserId, StartTime, EndTime, TotalHours, Description |
| 8 | `Notification` | In-app notifications for users | NotificationId, UserId, Title, Message, Type, IsRead, RelatedTaskId |
| 9 | `UserSettings` | User preferences and configuration | Id, UserId, Theme, Language, NotificationPreferences |

### Seed Data

`DbSeeder.cs` seeds:
- **5 Roles**: Admin, Manager, Employee, Team Lead, HR
- **Default Admin User**: Pre-configured admin account for initial access

---

## 5. Backend — ASP.NET Core Web API

### Project: `TaskManager.API`

**Location**: `taskmanager-server/`

### Directory Structure

```
taskmanager-server/
├── Controllers/              # 11 API Controllers
│   ├── AuthController.cs            # Login, Register
│   ├── UsersController.cs           # User CRUD, status toggle, roles
│   ├── RolesController.cs           # Role listing
│   ├── TeamsController.cs           # Team CRUD, members, hierarchy
│   ├── TasksController.cs          # Task CRUD, status updates, filters
│   ├── WorkLogsController.cs        # Time entry CRUD, summaries
│   ├── AnalyticsController.cs       # Completion rates, productivity scores
│   ├── ManagersController.cs        # Manager search, dashboard, reports
│   ├── NotificationsController.cs   # User notifications
│   ├── WorkloadController.cs        # Workload calculation, recommendations
│   └── SettingsController.cs        # User settings/preferences
│
├── Models/                   # 9 Entity Models
│   ├── User.cs
│   ├── Role.cs
│   ├── UserRole.cs
│   ├── Team.cs
│   ├── TeamMember.cs
│   ├── TaskItem.cs
│   ├── WorkLog.cs
│   ├── Notification.cs
│   └── UserSettings.cs
│
├── DTOs/                     # Data Transfer Objects
│   ├── Auth/                        # LoginRequestDto, RegisterRequestDto, etc.
│   ├── UserDto.cs
│   ├── TeamDto.cs
│   ├── TaskDto.cs
│   ├── WorkLogDto.cs
│   ├── AnalyticsDto.cs
│   ├── NotificationDto.cs
│   └── SettingsDto.cs
│
├── Services/                 # Business Logic
│   ├── AuthService.cs               # Registration, login, password hashing
│   └── JwtService.cs                # JWT token generation and validation
│
├── Data/                     # Database Layer
│   ├── AppDbContext.cs              # EF Core DbContext with all DbSets
│   └── DbSeeder.cs                 # Seed roles and default admin
│
├── Middleware/
│   └── ErrorHandlingMiddleware.cs   # Global exception handling
│
├── Program.cs                # Application entry point & DI configuration
├── appsettings.json          # Database connection, JWT config
└── TaskManager.API.csproj    # .NET 9.0, NuGet packages
```

### Key Configuration (Program.cs)

1. **Database**: SQL Server via EF Core — `AppDbContext` registered as scoped service
2. **Authentication**: JWT Bearer with HMAC-SHA256 signing, 60-min expiry
3. **CORS**: Allows `localhost:5173`, `localhost:5174`, `localhost:3000`
4. **JSON**: camelCase naming, null values ignored
5. **Swagger**: Full OpenAPI docs at `/swagger` with JWT auth support
6. **Seed**: Auto-runs `DbSeeder.Seed()` on startup

### NuGet Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `BCrypt.Net-Next` | 4.0.3 | Password hashing |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.2 | JWT auth middleware |
| `Microsoft.EntityFrameworkCore.SqlServer` | 9.0.2 | SQL Server ORM |
| `Microsoft.EntityFrameworkCore.Tools` | 9.0.2 | EF migrations/tooling |
| `Swashbuckle.AspNetCore` | 6.9.0 | Swagger/OpenAPI UI |

---

## 6. Frontend — React + Vite SPA

### Project: `taskmanager-client`

**Location**: `taskmanager-client/`

### Directory Structure

```
taskmanager-client/
├── src/
│   ├── App.jsx                      # Root component with Router
│   ├── main.jsx                     # React DOM entry point
│   ├── index.css                    # TailwindCSS + global styles
│   │
│   ├── api/                         # 11 Axios API Modules
│   │   ├── axiosInstance.js         #   Base config + interceptors
│   │   ├── authApi.js               #   Login, register
│   │   ├── userApi.js               #   User CRUD
│   │   ├── teamApi.js               #   Team CRUD, members, hierarchy
│   │   ├── taskApi.js               #   Task CRUD, filters
│   │   ├── workLogApi.js            #   Time logging
│   │   ├── analyticsApi.js          #   Analytics queries
│   │   ├── managerApi.js            #   Manager dashboard, search
│   │   ├── notificationApi.js       #   Notifications
│   │   ├── workloadApi.js           #   Workload data
│   │   └── settingsApi.js           #   User settings
│   │
│   ├── context/                     # React Context Providers
│   │   ├── AuthContext.jsx          #   Auth state, login/logout, token mgmt
│   │   └── NotificationContext.jsx  #   Notification state, unread count
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── useAuth.js               #   Shortcut to AuthContext
│   │   ├── useTasks.js              #   Task fetching & state
│   │   ├── useTeams.js              #   Team fetching & state
│   │   └── useWorkload.js           #   Workload data hook
│   │
│   ├── components/                  # 44 Reusable Components
│   │   ├── layout/       (4)       #   DashboardLayout, Sidebar, Header, Footer
│   │   ├── common/       (9)       #   Button, Modal, Table, Card, Badge,
│   │   │                           #   LoadingSpinner, SearchBar, Pagination,
│   │   │                           #   CustomSelect
│   │   ├── auth/         (3)       #   LoginForm, ProtectedRoute, RoleBasedRedirect
│   │   ├── analytics/    (8)       #   TaskBarChart, StatusPieChart,
│   │   │                           #   WeeklyLineChart, TeamComparisonChart,
│   │   │                           #   HoursAreaChart, PriorityRadialChart,
│   │   │                           #   RealTimeActivityChart, WorkloadHeatBar
│   │   ├── tasks/        (5)       #   TaskList, TaskForm, TaskCard,
│   │   │                           #   TaskStatusBadge, TaskFilters
│   │   ├── teams/        (4)       #   TeamList, TeamForm, HierarchyTree,
│   │   │                           #   TeamMemberList
│   │   ├── users/        (3)       #   UserList, UserForm, UserCard
│   │   ├── worklogs/     (3)       #   WorkLogForm, WorkLogList, TimeTracker
│   │   ├── workload/     (2)       #   WorkloadGauge, RecommendationPanel
│   │   ├── notifications/(2)       #   NotificationBell, NotificationList
│   │   └── employee/     (1)       #   EmployeeTaskCard
│   │
│   ├── pages/                       # 39+ Route-Level Pages
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx        #   Admin dashboard
│   │   ├── SettingsPage.jsx         #   User settings
│   │   ├── LeaderboardPage.jsx      #   Gamification leaderboard
│   │   ├── AchievementsPage.jsx     #   Gamification achievements
│   │   ├── NotFoundPage.jsx         #   404 page
│   │   │
│   │   ├── admin/        (5)       #   UserManagement, RoleManagement,
│   │   │                           #   AuditLogPage, SystemHealthPage,
│   │   │                           #   EmployeeInsightsPage
│   │   │
│   │   ├── manager/      (6)       #   ManagerDashboard, ManagerSearchPage,
│   │   │                           #   MyTeamPage, ApprovalQueue, TeamPulse,
│   │   │                           #   ManagerTimeLogsPage
│   │   │
│   │   ├── teamlead/     (2)       #   TeamLeadDashboard, TeamLeadTimeLogsPage
│   │   │
│   │   ├── employee/     (7)       #   EmployeeDashboard, MyTasksPage,
│   │   │                           #   FocusMode, DailyGoalsPage,
│   │   │                           #   SkillProgressPage, PeerRecognitionPage,
│   │   │                           #   WeeklyReflectionPage
│   │   │
│   │   ├── hr/           (5)       #   HRDashboard, HREmployeesPage,
│   │   │                           #   HRAnalyticsPage, HRTeamsPage,
│   │   │                           #   HRTimeLogsPage
│   │   │
│   │   ├── teams/        (3)       #   TeamsPage, TeamDetailPage,
│   │   │                           #   TeamsHierarchyPage
│   │   ├── tasks/        (2)       #   TasksPage, TaskDetailPage
│   │   ├── analytics/    (1)       #   AnalyticsDashboard
│   │   ├── workload/     (1)       #   WorkloadPage
│   │   └── worklogs/     (1)       #   TimeLoggingPage
│   │
│   ├── routes/                      # Routing Configuration
│   │   ├── AppRoutes.jsx            #   All route definitions
│   │   └── ProtectedRoute.jsx       #   Auth + role guard wrapper
│   │
│   ├── config/                      # Mock Data & Configuration
│   │   ├── mockEmployeeFeatures.js  #   Mock data for gamification features
│   │   └── mockUsers.js             #   Mock user data
│   │
│   └── utils/                       # Utility Functions
│       ├── constants.js             #   App-wide constants
│       ├── helpers.js               #   General helper functions
│       ├── dateUtils.js             #   Date formatting & manipulation
│       ├── roleUtils.js             #   Role checking & permission helpers
│       └── chartSetup.js            #   Chart.js global configuration
│
├── index.html                       # HTML entry point
├── vite.config.js                   # Vite build configuration
└── package.json                     # Dependencies & scripts
```

---

## 7. Module Breakdown

### Module 1: Authentication & User Management

**What it does**: Handles user registration, login, JWT token-based authentication, and full user CRUD operations for admins.

| Component | Details |
|-----------|---------|
| **Backend** | `AuthController`, `UsersController`, `RolesController` |
| **Services** | `AuthService` (login/register/password hashing), `JwtService` (token generation) |
| **Models** | `User`, `Role`, `UserRole` |
| **Frontend Pages** | `LoginPage`, `UserManagement`, `RoleManagement` |
| **Context** | `AuthContext` — stores user info, token, login/logout functions |
| **Key Features** | JWT authentication, BCrypt password hashing, role-based access, user activation/deactivation |

**Auth Flow**:
1. User submits login form → `POST /api/auth/login`
2. Backend validates credentials, returns JWT token + user data
3. Token stored in `AuthContext` (React state)
4. Axios interceptor attaches `Authorization: Bearer <token>` to all subsequent requests
5. `ProtectedRoute` component checks auth state + role before rendering pages
6. On `401` response → user is logged out and redirected to login

---

### Module 2: Team & Hierarchy Management

**What it does**: Manages organizational teams, member assignments, and the hierarchical reporting structure (Manager → Employees).

| Component | Details |
|-----------|---------|
| **Backend** | `TeamsController` |
| **Models** | `Team`, `TeamMember`, self-referencing `User.ManagerId` |
| **Frontend Pages** | `TeamsPage`, `TeamDetailPage`, `TeamsHierarchyPage`, `MyTeamPage` |
| **Frontend Components** | `TeamList`, `TeamForm`, `HierarchyTree`, `TeamMemberList` |
| **Key Features** | Team CRUD, add/remove members, recursive hierarchy tree visualization, manager search |

---

### Module 3: Task Assignment & Management

**What it does**: Full lifecycle task management — create, assign to employees, track status, set priorities and deadlines.

| Component | Details |
|-----------|---------|
| **Backend** | `TasksController` |
| **Model** | `TaskItem` (named to avoid conflict with `System.Threading.Tasks.Task`) |
| **Frontend Pages** | `TasksPage`, `TaskDetailPage`, `MyTasksPage` |
| **Frontend Components** | `TaskList`, `TaskForm`, `TaskCard`, `TaskStatusBadge`, `TaskFilters` |
| **Status Workflow** | `Pending` → `In Progress` → `Completed` / `Overdue` |
| **Priorities** | Low (0), Medium (1), High (2) |
| **Key Features** | Filter by status/priority/assignee/date, deadline tracking, overdue detection |

---

### Module 4: Time Tracking & Work Logs

**What it does**: Employees log hours against tasks. Managers view team-wide time data with summaries.

| Component | Details |
|-----------|---------|
| **Backend** | `WorkLogsController` |
| **Model** | `WorkLog` |
| **Frontend Pages** | `TimeLoggingPage` (Employee), `ManagerTimeLogsPage` (Manager), `TeamLeadTimeLogsPage`, `HRTimeLogsPage` |
| **Frontend Components** | `WorkLogForm`, `WorkLogList`, `TimeTracker` |
| **Key Features** | Start/end time logging, total hours calculation, weekly summaries, role-specific views |

---

### Module 5: Manager Search & Reporting Dashboard

**What it does**: Search for managers and view their complete team structure, employee reports, and performance summaries.

| Component | Details |
|-----------|---------|
| **Backend** | `ManagersController` |
| **Frontend Pages** | `ManagerSearchPage`, `ManagerDashboard` |
| **Key Features** | Manager search with autocomplete, expandable team hierarchy, per-employee task lists, team productivity summaries |

---

### Module 6: Performance Analytics

**What it does**: Rich analytics dashboards with multiple chart types for tracking team and individual performance.

| Component | Details |
|-----------|---------|
| **Backend** | `AnalyticsController` |
| **Frontend Pages** | `AnalyticsDashboard`, `HRAnalyticsPage` |
| **Chart Components** | `TaskBarChart`, `StatusPieChart`, `WeeklyLineChart`, `TeamComparisonChart`, `HoursAreaChart`, `PriorityRadialChart`, `RealTimeActivityChart`, `WorkloadHeatBar` |
| **Metrics** | Task completion rate, average completion time, productivity scores, team comparisons, weekly trends, task distribution by status/priority |

---

### Module 7: Notifications

**What it does**: In-app notification system for task assignments, reminders, and alerts.

| Component | Details |
|-----------|---------|
| **Backend** | `NotificationsController` |
| **Model** | `Notification` |
| **Context** | `NotificationContext` — manages notification state and unread count |
| **Frontend Components** | `NotificationBell` (header icon with badge), `NotificationList` (dropdown panel) |
| **Notification Types** | Info, TaskAssigned, DeadlineReminder, TaskOverdue, ManagerAlert |

---

### Module 8: Intelligent Workload Balancing

**What it does**: Calculates employee workload percentages and recommends the least-loaded team member for new task assignments.

| Component | Details |
|-----------|---------|
| **Backend** | `WorkloadController` |
| **Frontend Pages** | `WorkloadPage` |
| **Frontend Components** | `WorkloadGauge` (visual % bar), `RecommendationPanel` |
| **Algorithm** | `WorkloadPct = (ActiveTaskEstimatedHours / MaxCapacityHours) × 100` |
| **Color Coding** | Green < 50%, Yellow 50-80%, Red > 80% |

---

### Module 9: User Settings & Preferences

**What it does**: Comprehensive user profile and preferences management.

| Component | Details |
|-----------|---------|
| **Backend** | `SettingsController` |
| **Model** | `UserSettings` |
| **Frontend Page** | `SettingsPage` |
| **Key Features** | Profile editing, notification preferences, theme/appearance settings, security settings |

---

### Module 10: Gamification & Employee Engagement

**What it does**: Unique employee engagement features to boost productivity and team morale.

| Component | Details |
|-----------|---------|
| **Frontend Pages** | `LeaderboardPage`, `AchievementsPage`, `DailyGoalsPage`, `SkillProgressPage`, `PeerRecognitionPage`, `WeeklyReflectionPage`, `FocusMode` |
| **Config** | `mockEmployeeFeatures.js` — mock data for gamification features |
| **Key Features** | Points-based leaderboard, achievement badges, daily goal tracking, skill progress visualization, peer-to-peer recognition, weekly reflection journaling, distraction-free focus mode |

---

### Module 11: Admin Operations

**What it does**: Admin-exclusive operational tools for system oversight.

| Component | Details |
|-----------|---------|
| **Frontend Pages** | `AuditLogPage`, `SystemHealthPage`, `EmployeeInsightsPage` |
| **Key Features** | System audit trail, health monitoring, cross-team employee insights and analytics |

---

## 8. Application Workflow

### End-to-End User Journey

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER ARRIVES                                             │
│     → Hits / (root)                                          │
│     → RoleBasedRedirect checks auth                          │
│     → If not logged in → redirected to /login                │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. LOGIN                                                    │
│     → User enters email + password                           │
│     → Frontend calls POST /api/auth/login                    │
│     → Backend validates → returns JWT + user data            │
│     → AuthContext stores token + user                        │
│     → Redirect based on role:                                │
│        Admin    → /dashboard                                 │
│        Manager  → /manager/dashboard                         │
│        TeamLead → /teamlead/dashboard                        │
│        Employee → /employee/dashboard                        │
│        HR       → /hr/dashboard                              │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ROLE-SPECIFIC DASHBOARD                                  │
│                                                              │
│  ┌─ ADMIN ─────────────────────────────────────────────────┐ │
│  │ • System overview with KPI cards                        │ │
│  │ • User/role management, audit logs, system health       │ │
│  │ • Full access to all modules                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ MANAGER ───────────────────────────────────────────────┐ │
│  │ • Team overview with member cards                       │ │
│  │ • Task assignment & tracking across teams               │ │
│  │ • Team pulse, approval queue, time logs                 │ │
│  │ • Analytics & workload balancing                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ TEAM LEAD ─────────────────────────────────────────────┐ │
│  │ • Team task overview                                    │ │
│  │ • Task assignment within team                           │ │
│  │ • Team time logs & workload view                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ EMPLOYEE ──────────────────────────────────────────────┐ │
│  │ • Personal task list with status updates                │ │
│  │ • Time logging (timer + manual entry)                   │ │
│  │ • Daily goals, focus mode, skill progress               │ │
│  │ • Peer recognition, weekly reflections                  │ │
│  │ • Leaderboard & achievements                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ HR ────────────────────────────────────────────────────┐ │
│  │ • Employee directory with filters                       │ │
│  │ • Team overview & structure                             │ │
│  │ • Performance analytics & reports                       │ │
│  │ • Organization-wide time log visibility                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Task Lifecycle

```
   Manager/TeamLead                                  Employee
   creates task ──→ POST /api/tasks ──→ Status: PENDING
                                            │
                                            ▼
                                   Employee picks up task
                                   PATCH /api/tasks/{id}/status
                                   Status: IN PROGRESS
                                            │
                         ┌──────────────────┼──────────────────┐
                         ▼                                     ▼
                 Employee logs time                     Deadline passes?
                 POST /api/worklogs                     Background check
                         │                              Status: OVERDUE
                         ▼                                     │
                 Employee completes                     Notification sent
                 Status: COMPLETED                      to employee + manager
                         │
                         ▼
                 Analytics updated
                 Completion rate, productivity scores
```

### Time Logging Flow

```
Employee on Task Detail Page
  → Clicks "Log Time"
  → Enters Start Time, End Time, Description
  → POST /api/worklogs
  → Backend validates (no overlap, end > start)
  → TotalHours auto-calculated
  → WorkLog saved to DB
  → Summary view updated with new entry
```

---

## 9. API Endpoint Catalog

### Total: 45+ Endpoints across 11 Controllers

#### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |

#### Users (`/api/users`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/users` | Yes | Admin, HR |
| GET | `/api/users/{id}` | Yes | Admin, HR |
| POST | `/api/users` | Yes | Admin |
| PUT | `/api/users/{id}` | Yes | Admin |
| PATCH | `/api/users/{id}/status` | Yes | Admin |
| PUT | `/api/users/{id}/roles` | Yes | Admin |
| GET | `/api/users/me` | Yes | All |

#### Roles (`/api/roles`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/roles` | Yes | Admin |

#### Teams (`/api/teams`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/teams` | Yes | Admin, Manager |
| GET | `/api/teams/{id}` | Yes | All |
| POST | `/api/teams` | Yes | Admin |
| PUT | `/api/teams/{id}` | Yes | Admin, Manager |
| POST | `/api/teams/{id}/members` | Yes | Admin, Manager |
| DELETE | `/api/teams/{id}/members/{userId}` | Yes | Admin, Manager |
| GET | `/api/teams/{id}/members` | Yes | All |
| GET | `/api/teams/hierarchy/{managerId}` | Yes | All |
| GET | `/api/teams/manager-search` | Yes | Admin, Manager, HR |

#### Tasks (`/api/tasks`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/tasks` | Yes | All |
| GET | `/api/tasks/{id}` | Yes | All |
| POST | `/api/tasks` | Yes | Admin, Manager, TeamLead |
| PUT | `/api/tasks/{id}` | Yes | Admin, Manager, TeamLead |
| PATCH | `/api/tasks/{id}/status` | Yes | All (own tasks) |
| GET | `/api/tasks/employee/{employeeId}` | Yes | Admin, Manager, Self |
| GET | `/api/tasks/manager/{managerId}` | Yes | Admin, Manager |
| GET | `/api/tasks/team/{teamId}` | Yes | Admin, Manager, TeamLead |
| DELETE | `/api/tasks/{id}` | Yes | Admin, Manager |

#### Work Logs (`/api/worklogs`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/api/worklogs` | Yes | All |
| GET | `/api/worklogs/task/{taskId}` | Yes | All |
| GET | `/api/worklogs/employee/{userId}` | Yes | Admin, Manager, Self |
| GET | `/api/worklogs/employee/{userId}/summary` | Yes | Admin, Manager, Self |
| GET | `/api/worklogs/employee/{userId}/weekly` | Yes | Admin, Manager, Self |
| PUT | `/api/worklogs/{id}` | Yes | Self |
| DELETE | `/api/worklogs/{id}` | Yes | Self, Admin |

#### Managers (`/api/managers`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/managers/search` | Yes | Admin, Manager, HR |
| GET | `/api/managers/{id}/dashboard` | Yes | Admin, Manager |
| GET | `/api/managers/{id}/hierarchy` | Yes | All |
| GET | `/api/managers/{id}/team-report` | Yes | Admin, Manager, HR |

#### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/analytics/completion-rate` | Yes | Admin, Manager, HR |
| GET | `/api/analytics/avg-completion-time` | Yes | Admin, Manager, HR |
| GET | `/api/analytics/productivity-scores` | Yes | Admin, Manager, HR |
| GET | `/api/analytics/team-comparison` | Yes | Admin, Manager, HR |
| GET | `/api/analytics/weekly-productivity/{userId}` | Yes | Admin, Manager, Self |
| GET | `/api/analytics/task-distribution` | Yes | Admin, Manager, HR |

#### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/notifications` | Yes | All |
| GET | `/api/notifications/unread-count` | Yes | All |
| PATCH | `/api/notifications/{id}/read` | Yes | All |
| PATCH | `/api/notifications/read-all` | Yes | All |

#### Workload (`/api/workload`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/workload/team/{teamId}` | Yes | Admin, Manager, TeamLead |
| GET | `/api/workload/employee/{userId}` | Yes | Admin, Manager, Self |
| GET | `/api/workload/recommend/{teamId}` | Yes | Admin, Manager, TeamLead |

#### Settings (`/api/settings`)
| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/api/settings` | Yes | All |
| PUT | `/api/settings` | Yes | All |

---

## 10. Security & Authentication

### Authentication Strategy
- **JWT Bearer Tokens** with HMAC-SHA256 signing
- **Token Expiry**: 60 minutes (configurable)
- **Refresh Token Expiry**: 7 days
- **Password Hashing**: BCrypt with secure work factor
- **Issuer**: `CogniStruct.API`
- **Audience**: `CogniStruct.Client`

### Authorization (Role-Based Access Control)
- 5 roles: **Admin**, **Manager**, **Team Lead**, **Employee**, **HR**
- Controller-level `[Authorize(Roles = "...")]` attributes
- Frontend `ProtectedRoute` component enforces role-based page access
- `RoleBasedRedirect` component routes to appropriate dashboard on login

### CORS Configuration
- Whitelisted origins: `localhost:5173`, `localhost:5174`, `localhost:3000`
- Credentials allowed (for cookie-based tokens)
- Any header and method allowed

### Frontend Security
- Token stored in React Context (in-memory, not localStorage)
- Axios interceptor auto-attaches JWT to every request
- `ProtectedRoute` wraps all authenticated pages
- Role-specific sidebar navigation hides unauthorized links

---

## 11. Routing & Navigation

### Role-Based Navigation (Sidebar)

| Role | Available Menu Items |
|------|---------------------|
| **Admin** | Dashboard, Users, Roles, Teams, Teams Hierarchy, Tasks, Analytics, Workload, Manager Search, Audit Log, System Health, Employee Insights, Settings |
| **Manager** | Manager Dashboard, My Team, Tasks, Approvals, Team Pulse, Time Logs, Analytics, Teams, Workload, Manager Search, Settings |
| **Team Lead** | Team Lead Dashboard, My Team, Tasks, Time Logs, Workload, Settings |
| **Employee** | Employee Dashboard, My Tasks, Time Logs, Daily Goals, Focus Mode, Skills, Recognition, Reflections, Leaderboard, Achievements, Settings |
| **HR** | HR Dashboard, Employees, Teams, Time Logs, Analytics, Settings |

### Route Definitions (39+ routes)

All routes are defined in `AppRoutes.jsx` with `ProtectedRoute` wrappers:

| Route | Component | Allowed Roles |
|-------|-----------|--------------|
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | Admin |
| `/users` | UserManagement | Admin |
| `/roles` | RoleManagement | Admin |
| `/audit-log` | AuditLogPage | Admin |
| `/system-health` | SystemHealthPage | Admin |
| `/employee-insights` | EmployeeInsightsPage | Admin |
| `/teams` | TeamsPage | Admin, Manager, TeamLead, HR |
| `/teams/hierarchy` | TeamsHierarchyPage | Admin, Manager, TeamLead, HR |
| `/teams/:id` | TeamDetailPage | Admin, Manager, TeamLead, HR |
| `/tasks` | TasksPage | Admin, Manager, TeamLead |
| `/tasks/:id` | TaskDetailPage | Admin, Manager, TeamLead |
| `/analytics` | AnalyticsDashboard | Admin, Manager, HR |
| `/workload` | WorkloadPage | Admin, Manager, TeamLead |
| `/manager/dashboard` | ManagerDashboard | Admin, Manager |
| `/manager/team` | MyTeamPage | Admin, Manager, TeamLead |
| `/manager/tasks` | TasksPage | Admin, Manager |
| `/manager/approvals` | ApprovalQueue | Admin, Manager, TeamLead |
| `/manager/pulse` | TeamPulse | Admin, Manager, TeamLead |
| `/manager/time-logs` | ManagerTimeLogsPage | Admin, Manager |
| `/manager/analytics` | AnalyticsDashboard | Admin, Manager |
| `/manager/search` | ManagerSearchPage | Admin, Manager, TeamLead |
| `/teamlead/dashboard` | TeamLeadDashboard | TeamLead |
| `/teamlead/team` | MyTeamPage | TeamLead |
| `/teamlead/tasks` | TasksPage | TeamLead |
| `/teamlead/time-logs` | TeamLeadTimeLogsPage | TeamLead |
| `/teamlead/workload` | WorkloadPage | TeamLead |
| `/employee/dashboard` | EmployeeDashboard | All authenticated |
| `/employee/tasks` | MyTasksPage | All authenticated |
| `/employee/focus` | FocusMode | All authenticated |
| `/employee/goals` | DailyGoalsPage | All authenticated |
| `/employee/time-logs` | TimeLoggingPage | All authenticated |
| `/employee/skills` | SkillProgressPage | All authenticated |
| `/employee/recognition` | PeerRecognitionPage | All authenticated |
| `/employee/reflection` | WeeklyReflectionPage | All authenticated |
| `/employee/leaderboard` | LeaderboardPage | All authenticated |
| `/employee/achievements` | AchievementsPage | All authenticated |
| `/hr/dashboard` | HRDashboard | Admin, HR |
| `/hr/employees` | HREmployeesPage | Admin, HR |
| `/hr/teams` | HRTeamsPage | Admin, HR |
| `/hr/time-logs` | HRTimeLogsPage | Admin, HR |
| `/hr/analytics` | HRAnalyticsPage | Admin, HR |
| `/settings` | SettingsPage | All authenticated |
| `/time-logs` | TimeLoggingPage | All authenticated |
| `/leaderboard` | LeaderboardPage | All authenticated |
| `/achievements` | AchievementsPage | All authenticated |

---

## 12. Current Build Status

### What Has Been Built

| Area | Status | Details |
|------|--------|---------|
| **Backend API** | ✅ Fully Built | 11 controllers, complete CRUD operations for all entities |
| **Database Models** | ✅ Complete | 9 entity models with EF Core configuration |
| **Authentication** | ✅ Working | JWT login/register with BCrypt hashing |
| **Frontend Scaffold** | ✅ Complete | Vite + React + TailwindCSS setup |
| **All Pages** | ✅ Built | 39+ pages across all 5 role dashboards |
| **All Components** | ✅ Built | 44 reusable components |
| **API Integration** | ✅ Built | 11 API modules with Axios |
| **Routing** | ✅ Complete | Full role-based routing with guards |
| **Charts/Analytics** | ✅ Built | 8 chart components using Chart.js |
| **Gamification** | ✅ Built | Leaderboard, achievements, goals, focus mode, skills, recognition, reflections |
| **Settings** | ✅ Built | Full settings page with backend API |
| **UI Redesign** | ✅ Done | Professional enterprise-grade UI redesign completed |
| **Login Page Polish** | ✅ Done | Clean, professional login page refinement |
| **Manager Time Logs** | ✅ Done | Distinct manager-specific time logs page (separate from employee view) |

### Summary Stats

| Metric | Count |
|--------|-------|
| Backend Controllers | 11 |
| Entity Models | 9 |
| DTOs | 8+ categories |
| API Endpoints | 45+ |
| Frontend Pages | 39+ |
| Frontend Components | 44 |
| API Integration Modules | 11 |
| Custom Hooks | 4 |
| Context Providers | 2 |
| User Roles | 5 |
| Chart Components | 8 |
| Utility Modules | 5 |

---

## 13. How to Run

### Prerequisites
- **.NET 9 SDK** installed
- **Node.js 18+** and npm
- **SQL Server** (LocalDB or full instance)

### Backend

```bash
cd taskmanager-server

# Update connection string in appsettings.json if needed
# Default: Server=K-L0103;Database=CogniStructTaskDB;Trusted_Connection=True

dotnet run
# API runs at https://localhost:5001 or http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### Frontend

```bash
cd taskmanager-client

npm install
npm run dev
# App runs at http://localhost:5173
```

### Default Credentials
After the database is seeded by `DbSeeder.cs`, use the default admin account to log in. Check the seeder file for the exact credentials.

---

*This documentation was auto-generated on February 16, 2026, based on the current state of the CogniStruct codebase.*
