# CogniStruct — Task Management Platform

> A comprehensive, role-based workforce management system built for enterprise teams to manage tasks, track time, monitor workload, and foster employee engagement.

---

## 📌 Purpose & Motive

CogniStruct is designed to solve the challenge of **managing distributed teams** in an enterprise environment. It provides:

- **Centralized task management** — Create, assign, track, and complete tasks across teams
- **Time tracking** — Log work hours against tasks for productivity monitoring
- **Role-based access** — 5 distinct roles with tailored dashboards and permissions
- **Workload balancing** — Real-time workload analysis to prevent burnout
- **Employee engagement** — Daily updates, peer recognition, weekly reflections, skill tracking
- **Analytics & insights** — Data-driven decision making for managers and HR

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| **ASP.NET Core 9.0** | Web API framework |
| **Entity Framework Core 9.0** | ORM for database operations |
| **SQL Server** | Relational database |
| **JWT (JSON Web Tokens)** | Authentication & authorization |
| **BCrypt.Net** | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework (SPA) |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Tailwind CSS** | Utility-first CSS framework |

### Ports
| Service | URL |
|---|---|
| Backend API | `http://localhost:5000` |
| Frontend Dev Server | `http://localhost:5173` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  (Vite + React Router + Axios + Tailwind CSS)   │
│                  Port: 5173                      │
└─────────────┬───────────────────────────────────┘
              │  HTTP/REST (JSON)
              │  JWT Bearer Token
┌─────────────▼───────────────────────────────────┐
│              ASP.NET Core Web API                │
│        (Controllers + DTOs + Middleware)         │
│                  Port: 5000                      │
├─────────────────────────────────────────────────┤
│           Entity Framework Core (ORM)            │
└─────────────┬───────────────────────────────────┘
              │  SQL Queries
┌─────────────▼───────────────────────────────────┐
│              SQL Server Database                 │
│           (10 tables, Code-First)                │
└─────────────────────────────────────────────────┘
```

### Request Flow
1. User interacts with React UI
2. Axios sends HTTP request with JWT token in `Authorization` header
3. ASP.NET Core middleware validates JWT
4. `[Authorize(Roles = "...")]` checks role permissions
5. Controller processes request via Entity Framework
6. Response returned as JSON

---

## 🗄️ Database Schema (10 Tables)

### Core Tables

#### Users
| Column | Type | Description |
|---|---|---|
| UserId | int (PK) | Auto-increment ID |
| FirstName | nvarchar(100) | Required |
| LastName | nvarchar(100) | Required |
| Email | nvarchar(200) | Required, used for login |
| PasswordHash | nvarchar | BCrypt hashed password |
| IsActive | bit | Soft delete flag |
| ProfileImageUrl | nvarchar(500) | Avatar path |
| MiddleName | nvarchar(100) | Optional |
| DisplayName | nvarchar(200) | Optional display name |
| Gender | nvarchar(20) | Male/Female/Other |
| DateOfBirth | datetime2 | Optional |
| Nationality | nvarchar(100) | Optional |
| PersonalEmail | nvarchar(200) | Private email |
| MobileNumber | nvarchar(20) | Phone |
| WorkNumber | nvarchar(20) | Work phone |
| Bio | nvarchar(2000) | About me text |
| JobLove | nvarchar(1000) | "What I love about my job" |
| Interests | nvarchar(1000) | Hobbies |
| JobTitle | nvarchar(200) | Job title |
| WorkerType | nvarchar(50) | Permanent/Contract/Intern/Freelance/Part-Time |
| TimeType | nvarchar(50) | Full Time/Part Time/Flexible |
| NoticePeriod | nvarchar(100) | Notice period |
| InProbation | nvarchar(200) | Probation status |
| Skills | nvarchar(2000) | Comma-separated skills |
| ManagerId | int (FK → Users) | Direct reporting manager |
| RefreshToken | nvarchar | JWT refresh token |
| RefreshTokenExpiry | datetime2 | Token expiry |
| CreatedDate | datetime2 | Account creation |
| UpdatedDate | datetime2 | Last updated |

#### Roles
| Column | Type | Description |
|---|---|---|
| RoleId | int (PK) | Auto-increment ID |
| RoleName | nvarchar(50) | Admin, Manager, TeamLead, HR, Employee |
| Description | nvarchar(500) | Role description |

#### UserRoles (Many-to-Many Join)
| Column | Type | Description |
|---|---|---|
| UserId | int (FK → Users) | Composite PK |
| RoleId | int (FK → Roles) | Composite PK |

### Team Management

#### Teams
| Column | Type | Description |
|---|---|---|
| TeamId | int (PK) | Auto-increment ID |
| TeamName | nvarchar(200) | Team name |
| Description | nvarchar(1000) | Optional |
| ManagerId | int (FK → Users) | Team manager |
| IsActive | bit | Active flag |
| CreatedDate | datetime2 | Creation date |

#### TeamMembers (Many-to-Many Join)
| Column | Type | Description |
|---|---|---|
| TeamId | int (FK → Teams) | Composite PK |
| UserId | int (FK → Users) | Composite PK |
| JoinedDate | datetime2 | When member joined |

### Task Management

#### Tasks
| Column | Type | Description |
|---|---|---|
| TaskId | int (PK) | Auto-increment ID |
| Title | nvarchar(500) | Task title |
| Description | nvarchar(5000) | Detailed description |
| AssigneeId | int (FK → Users) | Person assigned |
| AssignerId | int (FK → Users) | Person who assigned |
| TeamId | int (FK → Teams) | Team association |
| Priority | int | 0=Low, 1=Medium, 2=High, 3=Critical |
| Status | int | 0=Pending, 1=Assigned, 2=InProgress, 3=Completed |
| Deadline | datetime2 | Due date |
| EstimatedHours | float | Estimated work hours |
| CreatedDate | datetime2 | Created |
| UpdatedDate | datetime2 | Updated |
| CompletedDate | datetime2 | When completed |

#### WorkLogs
| Column | Type | Description |
|---|---|---|
| WorkLogId | int (PK) | Auto-increment ID |
| TaskId | int (FK → Tasks) | Associated task |
| UserId | int (FK → Users) | Worker |
| StartTime | datetime2 | Start time |
| EndTime | datetime2 | End time |
| TotalHours | float | Duration |
| Description | nvarchar(2000) | Work description |
| CreatedDate | datetime2 | Log creation |

### Engagement & Notifications

#### DailyUpdateStatuses
| Column | Type | Description |
|---|---|---|
| DailyUpdateId | int (PK) | Auto-increment ID |
| UserId | int (FK → Users) | Employee |
| UpdateDate | date | Date of update |
| IsSent | bit | Whether sent |
| Summary | nvarchar(500) | Update text |
| AcknowledgedByUserId | int (FK → Users) | Acknowledger |
| AcknowledgedAt | datetime2 | Acknowledgment time |
| CreatedDate | datetime2 | Created |
| UpdatedDate | datetime2 | Updated |

#### Notifications
| Column | Type | Description |
|---|---|---|
| NotificationId | int (PK) | Auto-increment ID |
| UserId | int (FK → Users) | Recipient |
| Type | nvarchar(100) | Notification type |
| Message | nvarchar(1000) | Notification text |
| IsRead | bit | Read flag |
| CreatedDate | datetime2 | Created |

#### UserSettings
| Column | Type | Description |
|---|---|---|
| SettingsId | int (PK) | Auto-increment ID |
| UserId | int (FK → Users) | User |
| TimeZone | nvarchar(50) | Default: Asia/Kolkata |
| EmailNotifications | bit | Default: true |
| PushNotifications | bit | Default: true |
| TaskUpdateNotifications | bit | Default: true |
| TeamMessageNotifications | bit | Default: false |
| Theme | nvarchar(20) | light/dark |
| CompactMode | bit | Default: false |
| ShowOnlineStatus | bit | Default: true |
| ShowLastSeen | bit | Default: true |
| UpdatedDate | datetime2 | Updated |

---

## 👥 Role-Based Access Control (RBAC)

### 5 Roles & Their Capabilities

#### 🔴 Admin (Full System Access)
**Dashboard**: `/dashboard` — System-wide overview of users, tasks, teams
| Feature | Route | Description |
|---|---|---|
| User Management | `/users` | Create, edit, activate/deactivate users, assign roles & managers |
| Role Management | `/roles` | View roles and user counts |
| Team Management | `/teams` | Create/edit teams, add/remove members, assign team managers |
| Employee Insights | `/admin/insights` | Detailed employee analytics |
| System Health | `/admin/health` | System-level monitoring |
| Audit Logs | `/admin/audit-log` | Track all system actions |
| Analytics | `/analytics` | Organization-wide analytics |
| Workload | `/workload` | Cross-organization workload analysis |
| Profile | `/admin/profile` | Own profile (system overview stats) |

#### 🟢 Manager
**Dashboard**: `/manager/dashboard` — Team-focused overview
| Feature | Route | Description |
|---|---|---|
| My Team | `/manager/team` | View team members, performance, and manage team |
| Tasks | `/manager/tasks` | Task management for their teams |
| Approvals | `/manager/approvals` | Approve/reject team requests |
| Team Pulse | `/manager/pulse` | Quick team sentiment check-ins |
| Time Logs | `/manager/time-logs` | Team-wide time log monitoring |
| Analytics | `/manager/analytics` | Team analytics and productivity |
| Profile | `/manager/profile` | Own profile (team performance stats) |

#### 🟡 Team Lead
**Dashboard**: `/teamlead/dashboard` — Team-focused but scoped
| Feature | Route | Description |
|---|---|---|
| My Team | `/teamlead/team` | View team members |
| Tasks | `/teamlead/tasks` | Task management |
| Team Updates | `/teamlead/daily-updates` | View team's daily updates |
| Time Logs | `/teamlead/time-logs` | Team time log monitoring |
| Workload | `/teamlead/workload` | Team workload balancing |
| Profile | `/teamlead/profile` | Own profile (team stats) |

#### 🟣 HR
**Dashboard**: `/hr/dashboard` — Organization-wide people analytics
| Feature | Route | Description |
|---|---|---|
| Employees | `/hr/employees` | View all employees, manage profiles |
| Teams | `/hr/teams` | View all teams organization-wide |
| Time Logs | `/hr/time-logs` | Organization time log oversight |
| Analytics | `/hr/analytics` | HR-specific analytics (headcount, turnover) |
| Profile | `/hr/profile` | Own profile (org health stats) |

#### 🔵 Employee
**Dashboard**: `/employee/dashboard` — Personal productivity
| Feature | Route | Description |
|---|---|---|
| My Tasks | `/employee/tasks` | View and manage own tasks |
| Time Logs | `/employee/time-logs` | Log hours against tasks |
| Daily Update | `/employee/goals` | Send daily status updates to recipient |
| Skill Progress | `/employee/skills` | Track skill development/progress |
| Peer Recognition | `/employee/recognition` | Recognize and appreciate colleagues |
| Weekly Reflection | `/employee/reflection` | Weekly self-reflection journals |
| Leaderboard | `/employee/leaderboard` | Gamified productivity leaderboard |
| Profile | `/employee/profile` | Own profile with skills card |

---

## 🔐 Authentication System

### Login Flow
1. User submits email + password to `POST /api/auth/login`
2. Backend validates credentials (BCrypt hash comparison)
3. Returns JWT access token + refresh token
4. Frontend stores token in localStorage
5. All subsequent API calls include `Authorization: Bearer <token>` header

### JWT Token Structure
- **Claims**: UserId, Email, Roles (multiple)
- **Access Token**: Short-lived
- **Refresh Token**: Long-lived, stored in database

### Axios Interceptor (Frontend)
- Automatically attaches JWT to every request
- On 401 response → redirects to login

---

## 📡 API Endpoints (13 Controllers)

### AuthController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email + password |

### UsersController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users (with filters/pagination) |
| GET | `/api/users/{id}` | Admin | Get single user |
| POST | `/api/users` | Admin | Create new user |
| PUT | `/api/users/{id}` | Admin | Update user |
| PATCH | `/api/users/{id}/status` | Admin | Activate/deactivate |
| PUT | `/api/users/{id}/roles` | Admin | Assign roles |
| PUT | `/api/users/{id}/assign-manager` | Admin | Set reporting manager |
| GET | `/api/users/me` | All | Get current user info |
| PUT | `/api/users/me/profile` | All | Update own profile |
| POST | `/api/users/me/avatar` | All | Upload avatar image |
| GET | `/api/users/my-employees` | Manager | Get direct reports |

### ProfileController (Role-Based)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/admin/profile` | Admin | Admin-level profile with system stats |
| GET | `/api/manager/profile` | Manager | Manager profile with team stats |
| GET | `/api/teamlead/profile` | TeamLead | Team lead profile |
| GET | `/api/hr/profile` | HR | HR profile with org stats |
| GET | `/api/employee/profile` | All | Employee profile with personal stats |
| PUT | `/api/users/me/profile` | All | Update own profile fields |
| GET | `/api/users/{id}/public-profile` | All | Read-only public profile view |

### TasksController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/tasks` | All | List tasks (filtered by role) |
| GET | `/api/tasks/{id}` | All | Get task detail |
| POST | `/api/tasks` | Admin, Manager, TeamLead | Create task |
| PUT | `/api/tasks/{id}` | Admin, Manager, TeamLead | Update task |
| PATCH | `/api/tasks/{id}/status` | All | Update task status |
| DELETE | `/api/tasks/{id}` | Admin | Delete task |

### TeamsController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/teams` | All | List teams |
| GET | `/api/teams/{id}` | All | Get team detail with members & tasks |
| POST | `/api/teams` | Admin | Create team |
| PUT | `/api/teams/{id}` | Admin | Update team |
| POST | `/api/teams/{id}/members` | Admin | Add members |
| DELETE | `/api/teams/{id}/members/{userId}` | Admin | Remove member |
| DELETE | `/api/teams/{id}` | Admin | Delete team |

### WorkLogsController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/worklogs` | All | Get work logs (filtered) |
| POST | `/api/worklogs` | All | Create work log entry |
| PUT | `/api/worklogs/{id}` | All | Update work log |
| DELETE | `/api/worklogs/{id}` | All | Delete work log |

### WorkloadController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/workload/team/{teamId}` | Admin, Manager, HR | Team workload analysis |
| GET | `/api/workload/employee/{userId}` | Admin, Manager, HR | Individual workload |
| GET | `/api/workload/recommend/{teamId}` | Admin, Manager, HR | Task assignment recommendations |

### AnalyticsController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/analytics/completion-rate` | Admin, Manager, HR | Task completion analytics |
| GET | `/api/analytics/avg-completion-time` | Admin, Manager, HR | Average task duration |
| GET | `/api/analytics/productivity` | Admin, Manager, HR | Productivity scores |
| GET | `/api/analytics/team-comparison` | Admin, Manager, HR | Team comparison data |
| GET | `/api/analytics/weekly` | Admin, Manager, HR | Weekly productivity trends |

### DailyUpdatesController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/daily-updates/my` | Employee | Get own daily updates |
| POST | `/api/daily-updates` | Employee | Submit daily update |
| GET | `/api/daily-updates/team` | Manager, TeamLead | View team's daily updates |
| PUT | `/api/daily-updates/{id}/acknowledge` | Manager, TeamLead | Acknowledge update |

### SettingsController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/settings` | All | Get user settings |
| PUT | `/api/settings` | All | Update settings |
| PUT | `/api/settings/password` | All | Change password |

### NotificationsController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/notifications` | All | Get user notifications |
| PATCH | `/api/notifications/{id}/read` | All | Mark as read |

### ManagersController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/managers/dashboard` | Manager | Manager dashboard data |
| GET | `/api/managers/search` | Admin | Search managers |
| GET | `/api/managers/{id}` | Admin, Manager | Manager detail |

### RolesController
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/roles` | Admin | List all roles |

---

## ⚙️ Workload Calculation

### Formula
```
Workload % = min(100, round( (activeTasks / 10 × 50) + (weeklyHours / 40 × 50) ))
```

### Factors (50/50 Weight)
| Factor | What Counts | Constant |
|---|---|---|
| Active Tasks | Tasks where Status ≠ Completed | maxTasks = 10 |
| Weekly Hours | WorkLog hours in last 7 days | maxHours = 40 |

### Thresholds
| Range | Label |
|---|---|
| 0–29% | Low workload — has capacity |
| 30–59% | Moderate — can take more |
| 60–79% | Nearing capacity |
| 80–100% | Overloaded |

---

## 🎮 Employee Engagement Features

### Daily Updates
- Employee writes what they accomplished that day
- Sends to a manually-entered recipient
- Manager/TeamLead can view and acknowledge updates

### Skill Progress
- Track personal skill development over time
- Visual progress indicators

### Peer Recognition
- Recognize colleagues for great work
- Public appreciation system

### Weekly Reflection
- Weekly self-assessment journaling
- Track growth and challenges

### Leaderboard
- Gamified productivity ranking
- Based on task completion and activity

### Skills Card (Employee Profile)
- Add/remove personal skills as tags
- Displayed as chips in the About tab
- Replaces the "My Productivity" stats card

---

## 📁 Project Structure

```
New-CogniStruct-Task-Assign-main/
├── taskmanager-server/               # ASP.NET Core Backend
│   ├── Controllers/                  # 13 API controllers
│   │   ├── AuthController.cs         # Login/auth
│   │   ├── UsersController.cs        # CRUD users (Admin)
│   │   ├── ProfileController.cs      # Role-based profiles
│   │   ├── TasksController.cs        # Task CRUD
│   │   ├── TeamsController.cs        # Team management
│   │   ├── WorkLogsController.cs     # Time logging
│   │   ├── WorkloadController.cs     # Workload analysis
│   │   ├── AnalyticsController.cs    # Analytics/reports
│   │   ├── DailyUpdatesController.cs # Daily status updates
│   │   ├── SettingsController.cs     # User settings
│   │   ├── ManagersController.cs     # Manager dashboard
│   │   ├── NotificationsController.cs# Notifications
│   │   └── RolesController.cs        # Role listing
│   ├── Models/                       # 10 EF Core entities
│   │   ├── User.cs
│   │   ├── Role.cs / UserRole.cs
│   │   ├── Team.cs / TeamMember.cs
│   │   ├── TaskItem.cs
│   │   ├── WorkLog.cs
│   │   ├── DailyUpdateStatus.cs
│   │   ├── Notification.cs
│   │   └── UserSettings.cs
│   ├── DTOs/                         # Data Transfer Objects
│   │   ├── UserDto.cs                # Profile DTOs
│   │   ├── SettingsDto.cs            # Settings & update DTOs
│   │   ├── AnalyticsDto.cs           # Analytics & workload DTOs
│   │   └── DailyUpdateDto.cs         # Daily update DTOs
│   ├── Data/
│   │   └── AppDbContext.cs           # EF Core DB context
│   ├── Migrations/                   # Code-first migrations
│   ├── wwwroot/                      # Static files (avatars)
│   └── Program.cs                    # App bootstrap & middleware
│
├── taskmanager-client/               # React Frontend
│   ├── src/
│   │   ├── api/                      # 12 API modules
│   │   │   ├── axiosInstance.js       # Base Axios config + JWT
│   │   │   ├── authApi.js
│   │   │   ├── userApi.js
│   │   │   ├── taskApi.js
│   │   │   ├── teamApi.js
│   │   │   ├── workLogApi.js
│   │   │   ├── workloadApi.js
│   │   │   ├── analyticsApi.js
│   │   │   ├── dailyUpdateApi.js
│   │   │   ├── managerApi.js
│   │   │   ├── settingsApi.js
│   │   │   └── notificationApi.js
│   │   ├── pages/                    # 35+ pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx     # Admin dashboard
│   │   │   ├── MyProfilePage.jsx     # Own profile (all roles)
│   │   │   ├── PublicProfilePage.jsx # Read-only view of others
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── admin/               # 5 admin pages
│   │   │   ├── manager/             # 6 manager pages
│   │   │   ├── teamlead/            # 4 team lead pages
│   │   │   ├── employee/            # 6 employee pages
│   │   │   ├── hr/                  # 5 HR pages
│   │   │   ├── tasks/               # 2 task pages
│   │   │   ├── teams/               # 3 team pages
│   │   │   ├── analytics/           # 1 analytics page
│   │   │   ├── workload/            # 1 workload page
│   │   │   └── worklogs/            # 1 time logging page
│   │   ├── components/              # Reusable UI components
│   │   │   ├── layout/              # Sidebar, DashboardLayout, Header, Footer
│   │   │   ├── auth/                # ProtectedRoute, RoleBasedRedirect
│   │   │   ├── common/              # Card, DataTable, EmptyState, etc.
│   │   │   ├── tasks/               # TaskForm, TaskList, TaskCard, etc.
│   │   │   ├── teams/               # TeamMemberList, etc.
│   │   │   ├── users/               # UserList, UserForm, etc.
│   │   │   ├── workload/            # WorkloadGauge, RecommendationPanel
│   │   │   ├── worklogs/            # WorkLogForm, TimeTracker, etc.
│   │   │   ├── analytics/           # Charts, WorkloadHeatBar, etc.
│   │   │   └── notifications/       # NotificationList, Bell
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── hooks/                    # Custom hooks
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # All route definitions
│   │   └── utils/                    # Helper functions
│   └── index.html
```

---

## 🚀 How to Run

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- SQL Server (LocalDB or full)

### Backend
```bash
cd taskmanager-server
dotnet ef database update     # Apply migrations
dotnet run --urls "http://localhost:5000"
```

### Frontend
```bash
cd taskmanager-client
npm install
npm run dev                   # Starts on http://localhost:5173
```

---

## 🔑 Key Design Decisions

1. **Code-First Database** — Models define the schema, EF Core generates migrations
2. **Role-Based Routing** — Each role has its own URL prefix (`/admin/`, `/manager/`, `/employee/`, etc.)
3. **Inline Profile Editing** — Profile sections edit in-place without navigating away
4. **Public Profile View** — Read-only profiles accessible via `/view-profile/:userId`
5. **Skills as Comma-Separated** — Simple storage in a single field, parsed on frontend as chips
6. **Workload as 50/50 Formula** — Equal weight to tasks and hours for balanced assessment
7. **Static File Serving** — Avatar images served from `wwwroot/uploads/avatars/`
8. **Soft Deletes** — Users have `IsActive` flag instead of hard deletion
