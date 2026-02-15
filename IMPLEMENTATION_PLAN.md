# Team-Based Employee Task and Productivity Management System
## Hierarchical Reporting Structure — Implementation Plan

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Design](#3-architecture-design)
4. [Database Design](#4-database-design)
5. [Project Structure](#5-project-structure)
6. [Module Implementation Plans](#6-module-implementation-plans)
7. [Phase-wise Development Timeline](#7-phase-wise-development-timeline)
8. [API Endpoint Catalog](#8-api-endpoint-catalog)
9. [Security Strategy](#9-security-strategy)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Plan](#11-deployment-plan)

---

## 1. System Overview

### Purpose
An enterprise-grade task and productivity management platform that enables organizations to:
- Manage employees across teams with hierarchical reporting structures
- Assign, track, and monitor tasks with real-time status updates
- Log work hours and analyze productivity metrics
- Balance workloads intelligently across team members
- Generate performance analytics and reporting dashboards

### Key Actors
| Role         | Capabilities |
|--------------|-------------|
| **Admin**    | Full system control — user CRUD, role assignment, activate/deactivate users, system configuration |
| **Manager**  | Team management, task assignment, view team analytics, approve time logs |
| **Team Lead**| Assign tasks within team, view team progress, limited reporting |
| **Employee** | View assigned tasks, log work hours, update task status |
| **HR**       | View employee records, performance reports, team structures |

---

## 2. Technology Stack

| Layer            | Technology                              |
|------------------|-----------------------------------------|
| Frontend         | React 18 + Vite 5 + TailwindCSS 3      |
| State Management | React Context API + useReducer          |
| HTTP Client      | Axios with interceptors                 |
| Charting         | Recharts                                |
| Backend API      | ASP.NET Core 8 Web API (C#)            |
| ORM              | Entity Framework Core 8                 |
| Database         | SQL Server 2022                         |
| Authentication   | JWT Bearer Tokens                       |
| Authorization    | Role-Based Access Control (RBAC)        |
| Mapping          | AutoMapper 12                           |
| Validation       | FluentValidation                        |
| Logging          | Serilog                                 |
| Background Jobs  | Hangfire                                |
| API Docs         | Swagger / Swashbuckle                   |
| Email             | MailKit / SMTP                          |

---

## 3. Architecture Design

### 3.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│  (Vite + TailwindCSS + Axios + Context API + Recharts) │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS (JWT Bearer)
┌──────────────────────▼──────────────────────────────────┐
│               ASP.NET Core Web API                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Presentation Layer (Controllers)                │   │
│  │  - Receives HTTP requests                        │   │
│  │  - Input validation                              │   │
│  │  - Returns DTOs                                  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Application Layer (Services)                    │   │
│  │  - Business logic                                │   │
│  │  - Orchestration                                 │   │
│  │  - DTO ↔ Entity mapping (AutoMapper)             │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Domain Layer (Entities / Models)                │   │
│  │  - Core business entities                        │   │
│  │  - Enums, constants                              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Infrastructure Layer (Repositories + Data)      │   │
│  │  - EF Core DbContext                             │   │
│  │  - Repository implementations                    │   │
│  │  - External service integrations                 │   │
│  └──────────────────────────────────────────────────┘   │
│  Cross-Cutting: Logging, Auth, Exception Handling       │
└──────────────────────┬──────────────────────────────────┘
                       │ EF Core
┌──────────────────────▼──────────────────────────────────┐
│                  SQL Server Database                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Design Patterns Used

| Pattern                   | Usage                                        |
|---------------------------|----------------------------------------------|
| Repository Pattern        | Data access abstraction                      |
| Unit of Work              | Transaction management across repositories   |
| DTO Pattern               | Decouple API contracts from domain entities  |
| Dependency Injection      | Built-in ASP.NET Core DI container           |
| Middleware Pattern         | Auth, error handling, logging                |
| Strategy Pattern           | Workload balancing algorithm                 |
| Observer Pattern           | Notification dispatch                        |

### 3.3 Request Flow

```
Client Request
    → JWT Middleware (validate token)
    → Role Authorization Middleware
    → Controller (deserialize, validate input)
    → Service Layer (business logic, mapping)
    → Repository Layer (EF Core queries)
    → SQL Server (execute query)
    → Response bubbles back up through layers
    → JSON Response to Client
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram (Conceptual)

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
│              │
│ TaskId (PK)  │
│ Title        │       ┌──────────────┐
│ Description  │──1:N──│  WorkLogs    │
│ AssignedTo   │       │              │
│ AssignedBy   │       │ WorkLogId(PK)│
│ Priority     │       │ TaskId (FK)  │
│ Deadline     │       │ UserId (FK)  │
│ EstHours     │       │ StartTime    │
│ Status       │       │ EndTime      │
│ TeamId (FK)  │       │ TotalHours   │
│ CreatedDate  │       │ Description  │
└──────────────┘       └──────────────┘

┌──────────────────┐
│  Notifications   │
│                  │
│ NotifId (PK)     │
│ UserId (FK)      │
│ Title            │
│ Message          │
│ Type             │
│ IsRead           │
│ CreatedDate      │
└──────────────────┘
```

### 4.2 SQL Table Definitions

#### Users Table
```sql
CREATE TABLE Users (
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    FirstName       NVARCHAR(100) NOT NULL,
    LastName        NVARCHAR(100) NOT NULL,
    Email           NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(512) NOT NULL,
    IsActive        BIT NOT NULL DEFAULT 1,
    MaxCapacityHours DECIMAL(5,2) NOT NULL DEFAULT 40.00,
    ManagerId       INT NULL REFERENCES Users(UserId),
    CreatedDate     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedDate     DATETIME2 NULL
);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_ManagerId ON Users(ManagerId);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);
```

#### Roles Table
```sql
CREATE TABLE Roles (
    RoleId   INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);
-- Seed: Admin, Manager, Employee, TeamLead, HR
```

#### UserRoles Table
```sql
CREATE TABLE UserRoles (
    UserId INT NOT NULL REFERENCES Users(UserId),
    RoleId INT NOT NULL REFERENCES Roles(RoleId),
    PRIMARY KEY (UserId, RoleId)
);
```

#### Teams Table
```sql
CREATE TABLE Teams (
    TeamId      INT IDENTITY(1,1) PRIMARY KEY,
    TeamName    NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    ManagerId   INT NOT NULL REFERENCES Users(UserId),
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_Teams_ManagerId ON Teams(ManagerId);
```

#### TeamMembers Table
```sql
CREATE TABLE TeamMembers (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    TeamId     INT NOT NULL REFERENCES Teams(TeamId),
    UserId     INT NOT NULL REFERENCES Users(UserId),
    JoinedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive   BIT NOT NULL DEFAULT 1,
    UNIQUE(TeamId, UserId)
);
CREATE INDEX IX_TeamMembers_TeamId ON TeamMembers(TeamId);
CREATE INDEX IX_TeamMembers_UserId ON TeamMembers(UserId);
```

#### Tasks Table
```sql
CREATE TABLE Tasks (
    TaskId         INT IDENTITY(1,1) PRIMARY KEY,
    Title          NVARCHAR(300) NOT NULL,
    Description    NVARCHAR(MAX) NULL,
    AssignedTo     INT NOT NULL REFERENCES Users(UserId),
    AssignedBy     INT NOT NULL REFERENCES Users(UserId),
    TeamId         INT NULL REFERENCES Teams(TeamId),
    Priority       TINYINT NOT NULL DEFAULT 1, -- 0=Low, 1=Medium, 2=High
    Deadline       DATETIME2 NOT NULL,
    EstimatedHours DECIMAL(6,2) NOT NULL DEFAULT 0,
    Status         TINYINT NOT NULL DEFAULT 0, -- 0=Pending, 1=InProgress, 2=Completed, 3=Overdue
    CreatedDate    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedDate    DATETIME2 NULL,
    CompletedDate  DATETIME2 NULL
);
CREATE INDEX IX_Tasks_AssignedTo ON Tasks(AssignedTo);
CREATE INDEX IX_Tasks_AssignedBy ON Tasks(AssignedBy);
CREATE INDEX IX_Tasks_Status ON Tasks(Status);
CREATE INDEX IX_Tasks_Deadline ON Tasks(Deadline);
CREATE INDEX IX_Tasks_TeamId ON Tasks(TeamId);
```

#### WorkLogs Table
```sql
CREATE TABLE WorkLogs (
    WorkLogId   INT IDENTITY(1,1) PRIMARY KEY,
    TaskId      INT NOT NULL REFERENCES Tasks(TaskId),
    UserId      INT NOT NULL REFERENCES Users(UserId),
    StartTime   DATETIME2 NOT NULL,
    EndTime     DATETIME2 NOT NULL,
    TotalHours  AS CAST(DATEDIFF(MINUTE, StartTime, EndTime) / 60.0 AS DECIMAL(6,2)) PERSISTED,
    Description NVARCHAR(500) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_WorkLogs_TaskId ON WorkLogs(TaskId);
CREATE INDEX IX_WorkLogs_UserId ON WorkLogs(UserId);
CREATE INDEX IX_WorkLogs_StartTime ON WorkLogs(StartTime);
```

#### Notifications Table
```sql
CREATE TABLE Notifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId         INT NOT NULL REFERENCES Users(UserId),
    Title          NVARCHAR(200) NOT NULL,
    Message        NVARCHAR(MAX) NOT NULL,
    Type           TINYINT NOT NULL DEFAULT 0, -- 0=Info, 1=TaskAssigned, 2=Reminder, 3=Overdue, 4=Alert
    IsRead         BIT NOT NULL DEFAULT 0,
    RelatedTaskId  INT NULL REFERENCES Tasks(TaskId),
    CreatedDate    DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
```

### 4.3 Recursive Hierarchy Query (Manager → Employees)

```sql
WITH EmployeeHierarchy AS (
    -- Anchor: Start with the target manager
    SELECT UserId, FirstName, LastName, ManagerId, 0 AS Level
    FROM Users
    WHERE UserId = @ManagerId

    UNION ALL

    -- Recursive: Get direct reports
    SELECT u.UserId, u.FirstName, u.LastName, u.ManagerId, eh.Level + 1
    FROM Users u
    INNER JOIN EmployeeHierarchy eh ON u.ManagerId = eh.UserId
    WHERE u.IsActive = 1
)
SELECT * FROM EmployeeHierarchy ORDER BY Level, FirstName;
```

---

## 5. Project Structure

### 5.1 Backend (ASP.NET Core)

```
TaskManager/
├── TaskManager.sln
├── src/
│   ├── TaskManager.API/                          # Presentation Layer
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── RolesController.cs
│   │   │   ├── TeamsController.cs
│   │   │   ├── TasksController.cs
│   │   │   ├── WorkLogsController.cs
│   │   │   ├── AnalyticsController.cs
│   │   │   ├── NotificationsController.cs
│   │   │   └── WorkloadController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── RequestLoggingMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidationFilter.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── TaskManager.API.csproj
│   │
│   ├── TaskManager.Application/                  # Application/Service Layer
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequestDto.cs
│   │   │   │   ├── RegisterRequestDto.cs
│   │   │   │   └── AuthResponseDto.cs
│   │   │   ├── Users/
│   │   │   │   ├── UserDto.cs
│   │   │   │   ├── CreateUserDto.cs
│   │   │   │   └── UpdateUserDto.cs
│   │   │   ├── Teams/
│   │   │   │   ├── TeamDto.cs
│   │   │   │   ├── CreateTeamDto.cs
│   │   │   │   ├── TeamHierarchyDto.cs
│   │   │   │   └── TeamMemberDto.cs
│   │   │   ├── Tasks/
│   │   │   │   ├── TaskDto.cs
│   │   │   │   ├── CreateTaskDto.cs
│   │   │   │   ├── UpdateTaskStatusDto.cs
│   │   │   │   └── TaskFilterDto.cs
│   │   │   ├── WorkLogs/
│   │   │   │   ├── WorkLogDto.cs
│   │   │   │   ├── CreateWorkLogDto.cs
│   │   │   │   └── ProductivitySummaryDto.cs
│   │   │   ├── Analytics/
│   │   │   │   ├── TaskCompletionRateDto.cs
│   │   │   │   ├── ProductivityScoreDto.cs
│   │   │   │   ├── TeamComparisonDto.cs
│   │   │   │   └── WeeklyProductivityDto.cs
│   │   │   ├── Notifications/
│   │   │   │   └── NotificationDto.cs
│   │   │   └── Workload/
│   │   │       ├── WorkloadDto.cs
│   │   │       └── WorkloadRecommendationDto.cs
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IRoleService.cs
│   │   │   ├── ITeamService.cs
│   │   │   ├── ITaskService.cs
│   │   │   ├── IWorkLogService.cs
│   │   │   ├── IAnalyticsService.cs
│   │   │   ├── INotificationService.cs
│   │   │   └── IWorkloadService.cs
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── RoleService.cs
│   │   │   ├── TeamService.cs
│   │   │   ├── TaskService.cs
│   │   │   ├── WorkLogService.cs
│   │   │   ├── AnalyticsService.cs
│   │   │   ├── NotificationService.cs
│   │   │   ├── EmailService.cs
│   │   │   └── WorkloadService.cs
│   │   ├── Mappings/
│   │   │   └── MappingProfile.cs
│   │   ├── Validators/
│   │   │   ├── LoginRequestValidator.cs
│   │   │   ├── RegisterRequestValidator.cs
│   │   │   ├── CreateTaskValidator.cs
│   │   │   └── CreateWorkLogValidator.cs
│   │   └── TaskManager.Application.csproj
│   │
│   ├── TaskManager.Domain/                       # Domain Layer
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   ├── UserRole.cs
│   │   │   ├── Team.cs
│   │   │   ├── TeamMember.cs
│   │   │   ├── TaskItem.cs
│   │   │   ├── WorkLog.cs
│   │   │   └── Notification.cs
│   │   ├── Enums/
│   │   │   ├── TaskPriority.cs
│   │   │   ├── TaskStatus.cs
│   │   │   ├── NotificationType.cs
│   │   │   └── UserRoleEnum.cs
│   │   ├── Common/
│   │   │   ├── BaseEntity.cs
│   │   │   └── ApiResponse.cs
│   │   └── TaskManager.Domain.csproj
│   │
│   └── TaskManager.Infrastructure/               # Infrastructure Layer
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   ├── Configurations/
│       │   │   ├── UserConfiguration.cs
│       │   │   ├── RoleConfiguration.cs
│       │   │   ├── TeamConfiguration.cs
│       │   │   ├── TaskConfiguration.cs
│       │   │   ├── WorkLogConfiguration.cs
│       │   │   └── NotificationConfiguration.cs
│       │   └── Seed/
│       │       └── DataSeeder.cs
│       ├── Repositories/
│       │   ├── Interfaces/
│       │   │   ├── IGenericRepository.cs
│       │   │   ├── IUserRepository.cs
│       │   │   ├── ITeamRepository.cs
│       │   │   ├── ITaskRepository.cs
│       │   │   ├── IWorkLogRepository.cs
│       │   │   ├── INotificationRepository.cs
│       │   │   └── IUnitOfWork.cs
│       │   ├── GenericRepository.cs
│       │   ├── UserRepository.cs
│       │   ├── TeamRepository.cs
│       │   ├── TaskRepository.cs
│       │   ├── WorkLogRepository.cs
│       │   ├── NotificationRepository.cs
│       │   └── UnitOfWork.cs
│       ├── BackgroundJobs/
│       │   ├── OverdueTaskJob.cs
│       │   ├── ReminderJob.cs
│       │   └── HangfireConfig.cs
│       └── TaskManager.Infrastructure.csproj
│
└── tests/
    ├── TaskManager.UnitTests/
    │   ├── Services/
    │   └── TaskManager.UnitTests.csproj
    └── TaskManager.IntegrationTests/
        └── TaskManager.IntegrationTests.csproj
```

### 5.2 Frontend (React + Vite)

```
taskmanager-client/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.development
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                          # Tailwind imports
│   │
│   ├── api/                               # Axios setup & API calls
│   │   ├── axiosInstance.js               # Base Axios config + interceptors
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── teamApi.js
│   │   ├── taskApi.js
│   │   ├── workLogApi.js
│   │   ├── analyticsApi.js
│   │   ├── notificationApi.js
│   │   └── workloadApi.js
│   │
│   ├── context/                           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                             # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useTeams.js
│   │   └── useWorkload.js
│   │
│   ├── components/                        # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── Footer.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Pagination.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── users/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserForm.jsx
│   │   │   └── UserCard.jsx
│   │   ├── teams/
│   │   │   ├── TeamList.jsx
│   │   │   ├── TeamForm.jsx
│   │   │   ├── HierarchyTree.jsx
│   │   │   └── TeamMemberList.jsx
│   │   ├── tasks/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskStatusBadge.jsx
│   │   │   └── TaskFilters.jsx
│   │   ├── worklogs/
│   │   │   ├── WorkLogForm.jsx
│   │   │   ├── WorkLogList.jsx
│   │   │   └── TimeTracker.jsx
│   │   ├── analytics/
│   │   │   ├── TaskBarChart.jsx
│   │   │   ├── StatusPieChart.jsx
│   │   │   ├── WeeklyLineChart.jsx
│   │   │   └── TeamComparisonChart.jsx
│   │   ├── workload/
│   │   │   ├── WorkloadGauge.jsx
│   │   │   └── RecommendationPanel.jsx
│   │   └── notifications/
│   │       ├── NotificationBell.jsx
│   │       └── NotificationList.jsx
│   │
│   ├── pages/                             # Route-level pages
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx              # Role-aware dashboard
│   │   ├── admin/
│   │   │   ├── UserManagement.jsx
│   │   │   └── RoleManagement.jsx
│   │   ├── teams/
│   │   │   ├── TeamsPage.jsx
│   │   │   └── TeamDetailPage.jsx
│   │   ├── tasks/
│   │   │   ├── TasksPage.jsx
│   │   │   └── TaskDetailPage.jsx
│   │   ├── worklogs/
│   │   │   └── TimeLoggingPage.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── workload/
│   │   │   └── WorkloadPage.jsx
│   │   ├── manager/
│   │   │   ├── ManagerSearchPage.jsx
│   │   │   └── ManagerDashboard.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── routes/                            # Routing config
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   └── utils/                             # Utilities
│       ├── constants.js
│       ├── helpers.js
│       ├── dateUtils.js
│       └── roleUtils.js
│
└── README.md
```

---

## 6. Module Implementation Plans

---

### MODULE 1: User & Role Management

#### 1.1 Backend Implementation

**Entities:**
- `User` — UserId, FirstName, LastName, Email, PasswordHash, IsActive, MaxCapacityHours, ManagerId, CreatedDate, UpdatedDate
- `Role` — RoleId, RoleName
- `UserRole` — Composite key (UserId, RoleId)

**DTOs:**
- `LoginRequestDto` — Email, Password
- `RegisterRequestDto` — FirstName, LastName, Email, Password, ConfirmPassword
- `AuthResponseDto` — Token, RefreshToken, Expiration, UserDto
- `UserDto` — UserId, FullName, Email, IsActive, Roles[], CreatedDate
- `CreateUserDto` — FirstName, LastName, Email, Password, RoleIds[]
- `UpdateUserDto` — FirstName, LastName, Email, IsActive, RoleIds[]

**Services:**
- `AuthService`
  - `Register(RegisterRequestDto)` → Hash password with BCrypt, create user, generate JWT
  - `Login(LoginRequestDto)` → Validate credentials, generate JWT + Refresh Token
  - `RefreshToken(string refreshToken)` → Validate & issue new token pair
  - JWT Claims: UserId, Email, Roles[], Expiration

- `UserService`
  - `GetAllUsers(filter, pagination)` → Paginated user list
  - `GetUserById(id)` → Single user with roles
  - `CreateUser(CreateUserDto)` → Admin-only user creation
  - `UpdateUser(id, UpdateUserDto)` → Update profile & roles
  - `ActivateDeactivateUser(id, bool isActive)` → Toggle user status
  - `AssignRoles(userId, roleIds[])` → Replace user roles

**JWT Configuration:**
```
- Issuer, Audience from appsettings
- Token expiry: 60 minutes
- Refresh token expiry: 7 days
- HMAC-SHA256 signing
- Claims: sub (userId), email, roles (array)
```

**Password Hashing:**
- BCrypt with work factor 12
- Implemented in AuthService

**APIs:**
| Method | Endpoint                       | Auth   | Roles     |
|--------|-------------------------------|--------|-----------|
| POST   | /api/auth/register            | No     | Public    |
| POST   | /api/auth/login               | No     | Public    |
| POST   | /api/auth/refresh-token       | Yes    | All       |
| GET    | /api/users                    | Yes    | Admin     |
| GET    | /api/users/{id}               | Yes    | Admin, HR |
| POST   | /api/users                    | Yes    | Admin     |
| PUT    | /api/users/{id}               | Yes    | Admin     |
| PATCH  | /api/users/{id}/status        | Yes    | Admin     |
| PUT    | /api/users/{id}/roles         | Yes    | Admin     |
| GET    | /api/users/me                 | Yes    | All       |
| GET    | /api/roles                    | Yes    | Admin     |

#### 1.2 Frontend Implementation

**Pages:**
- `LoginPage` — Email/Password form, error display, redirect to dashboard
- `RegisterPage` — Registration form with validation
- `UserManagement` — Admin page with user table, create/edit modal, status toggle

**Auth Flow:**
1. User submits login form
2. Axios POST to `/api/auth/login`
3. On success: store JWT in memory (Context), refresh token in httpOnly cookie
4. `AuthContext` provides: user, token, login(), logout(), isAuthenticated
5. `ProtectedRoute` checks AuthContext, redirects to login if unauthenticated
6. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
7. On 401: attempt token refresh, if fail → logout

**Role-based Dashboard Logic:**
```
if (role === 'Admin')      → Admin Dashboard (user stats, system overview)
if (role === 'Manager')    → Manager Dashboard (team overview, pending tasks)
if (role === 'TeamLead')   → Team Lead Dashboard (team tasks, progress)
if (role === 'Employee')   → Employee Dashboard (my tasks, time logs)
if (role === 'HR')         → HR Dashboard (employee overview, performance)
```

---

### MODULE 2: Team & Hierarchy Management

#### 2.1 Backend Implementation

**Entities:**
- `Team` — TeamId, TeamName, Description, ManagerId (FK→Users), IsActive, CreatedDate
- `TeamMember` — Id, TeamId (FK→Teams), UserId (FK→Users), JoinedDate, IsActive
- Self-referencing relationship: `User.ManagerId → User.UserId`

**DTOs:**
- `TeamDto` — TeamId, TeamName, Description, Manager(UserDto), MemberCount, IsActive
- `CreateTeamDto` — TeamName, Description, ManagerId
- `TeamHierarchyDto` — Manager(UserDto), TeamName, Members[UserDto], Children[TeamHierarchyDto]
- `TeamMemberDto` — UserId, FullName, Email, Role, JoinedDate
- `ManagerSearchResultDto` — ManagerDetails, Teams[], HierarchyTree(JSON)

**Services:**
- `TeamService`
  - `CreateTeam(CreateTeamDto)` → Create team with manager
  - `GetTeamById(id)` → Team with members
  - `AddMemberToTeam(teamId, userId)` → Add employee
  - `RemoveMemberFromTeam(teamId, userId)` → Remove
  - `GetTeamsByManager(managerId)` → All teams for a manager
  - `GetHierarchyTree(managerId)` → Recursive hierarchy JSON
  - `SearchManager(query)` → Search and return full hierarchy

**Hierarchy Logic (LINQ Recursive):**
```csharp
public async Task<TeamHierarchyDto> GetHierarchyTree(int managerId)
{
    // 1. Get manager details
    // 2. Get all teams managed
    // 3. For each team, get members
    // 4. For each member who is also a manager, recurse
    // 5. Build tree structure
}
```

**Alternative: Raw SQL CTE (for large hierarchies):**
```sql
WITH Hierarchy AS (
    SELECT UserId, FirstName, LastName, ManagerId, 0 AS Depth
    FROM Users WHERE UserId = @ManagerId
    UNION ALL
    SELECT u.UserId, u.FirstName, u.LastName, u.ManagerId, h.Depth + 1
    FROM Users u JOIN Hierarchy h ON u.ManagerId = h.UserId
)
SELECT * FROM Hierarchy ORDER BY Depth;
```

**APIs:**
| Method | Endpoint                              | Auth | Roles            |
|--------|--------------------------------------|------|------------------|
| GET    | /api/teams                           | Yes  | Admin, Manager   |
| GET    | /api/teams/{id}                      | Yes  | All              |
| POST   | /api/teams                           | Yes  | Admin            |
| PUT    | /api/teams/{id}                      | Yes  | Admin, Manager   |
| POST   | /api/teams/{id}/members              | Yes  | Admin, Manager   |
| DELETE | /api/teams/{id}/members/{userId}     | Yes  | Admin, Manager   |
| GET    | /api/teams/{id}/members              | Yes  | All              |
| GET    | /api/teams/hierarchy/{managerId}     | Yes  | All              |
| GET    | /api/teams/manager-search?q={query}  | Yes  | Admin, Manager, HR |

#### 2.2 Frontend Implementation

**Components:**
- `TeamList` — Table of all teams with member count
- `TeamForm` — Create/Edit team modal
- `HierarchyTree` — Expandable tree component (recursive rendering)
- `TeamMemberList` — Members list with add/remove

**HierarchyTree Component Structure:**
```jsx
<HierarchyTree>
  <TreeNode data={manager} expanded>          // Manager A
    <TreeNode data={employee1} />             //   ├── Employee 1
    <TreeNode data={employee2} />             //   ├── Employee 2
    <TreeNode data={teamlead} expanded>       //   ├── Team Lead B
      <TreeNode data={employee4} />           //   │   ├── Employee 4
      <TreeNode data={employee5} />           //   │   └── Employee 5
    </TreeNode>
    <TreeNode data={employee3} />             //   └── Employee 3
  </TreeNode>
</HierarchyTree>
```

---

### MODULE 3: Task Assignment & Management

#### 3.1 Backend Implementation

**Entity: `TaskItem`** (named to avoid conflict with System.Threading.Tasks.Task)
- TaskId, Title, Description, AssignedTo (FK), AssignedBy (FK), TeamId (FK), Priority (enum), Deadline, EstimatedHours, Status (enum), CreatedDate, UpdatedDate, CompletedDate

**Enums:**
```csharp
public enum TaskPriority { Low = 0, Medium = 1, High = 2 }
public enum TaskItemStatus { Pending = 0, InProgress = 1, Completed = 2, Overdue = 3 }
```

**DTOs:**
- `TaskDto` — Full task with assignee/assigner names
- `CreateTaskDto` — Title, Description, AssignedTo, Priority, Deadline, EstimatedHours
- `UpdateTaskStatusDto` — Status
- `TaskFilterDto` — Status?, Priority?, AssignedTo?, DateFrom?, DateTo?, PageNumber, PageSize

**Services:**
- `TaskService`
  - `CreateTask(CreateTaskDto, assignedByUserId)` → Create + trigger notification
  - `UpdateTaskStatus(taskId, UpdateTaskStatusDto)` → Update status, set CompletedDate if completed
  - `GetTasksByEmployee(employeeId, filters)` → Paginated filtered list
  - `GetTasksByManager(managerId, filters)` → All tasks across manager's teams
  - `GetTaskById(taskId)` → Single task with work logs
  - `UpdateTask(taskId, UpdateTaskDto)` → Full update
  - `DeleteTask(taskId)` → Soft delete or hard delete
  - `CheckAndMarkOverdueTasks()` → Background job: mark overdue

**Auto-Overdue Logic (Hangfire Job):**
```csharp
// Runs every 15 minutes
public async Task MarkOverdueTasks()
{
    var overdueTasks = await _taskRepo.GetAll()
        .Where(t => t.Deadline < DateTime.UtcNow
                  && t.Status != TaskItemStatus.Completed
                  && t.Status != TaskItemStatus.Overdue)
        .ToListAsync();

    foreach (var task in overdueTasks)
    {
        task.Status = TaskItemStatus.Overdue;
        // Trigger notification to assignee and manager
    }
    await _unitOfWork.SaveChangesAsync();
}
```

**APIs:**
| Method | Endpoint                          | Auth | Roles                      |
|--------|----------------------------------|------|----------------------------|
| GET    | /api/tasks                       | Yes  | All                        |
| GET    | /api/tasks/{id}                  | Yes  | All                        |
| POST   | /api/tasks                       | Yes  | Admin, Manager, TeamLead   |
| PUT    | /api/tasks/{id}                  | Yes  | Admin, Manager, TeamLead   |
| PATCH  | /api/tasks/{id}/status           | Yes  | All (own tasks)            |
| GET    | /api/tasks/employee/{employeeId} | Yes  | Admin, Manager, Self       |
| GET    | /api/tasks/manager/{managerId}   | Yes  | Admin, Manager(self)       |
| GET    | /api/tasks/team/{teamId}         | Yes  | Admin, Manager, TeamLead   |
| DELETE | /api/tasks/{id}                  | Yes  | Admin, Manager             |

#### 3.2 Frontend Implementation

**Components:**
- `TaskList` — Filterable/sortable table with status badges
- `TaskForm` — Create/Edit task modal with employee dropdown
- `TaskCard` — Card view for individual task
- `TaskStatusBadge` — Color-coded status chip (green=completed, yellow=in-progress, red=overdue)
- `TaskFilters` — Filter bar: status, priority, date range, assignee

**Features:**
- Drag-and-drop status change (Pending → In Progress → Completed) (optional Kanban view)
- Priority color indicators
- Deadline countdown / overdue highlighting
- Bulk status updates

---

### MODULE 4: Time Tracking & Work Log

#### 4.1 Backend Implementation

**Entity: `WorkLog`**
- WorkLogId, TaskId (FK), UserId (FK), StartTime, EndTime, TotalHours (computed), Description, CreatedDate

**DTOs:**
- `WorkLogDto` — WorkLogId, TaskTitle, StartTime, EndTime, TotalHours, Description
- `CreateWorkLogDto` — TaskId, StartTime, EndTime, Description
- `ProductivitySummaryDto` — TotalHours, TaskCount, AvgHoursPerTask, WeeklyBreakdown[]

**Services:**
- `WorkLogService`
  - `CreateWorkLog(CreateWorkLogDto, userId)` → Validate no overlap, compute hours
  - `GetWorkLogsByTask(taskId)` → All logs for a task
  - `GetWorkLogsByEmployee(userId, dateFrom, dateTo)` → Filtered logs
  - `GetTotalHoursPerTask(taskId)` → Sum of all work log hours
  - `GetTotalHoursPerEmployee(userId, dateFrom, dateTo)` → Total hours worked
  - `GetWeeklyProductivity(userId)` → Hours per week for last 12 weeks
  - `DeleteWorkLog(workLogId)` → Remove log entry
  - `UpdateWorkLog(workLogId, UpdateWorkLogDto)` → Edit time entry

**Validation Rules:**
- EndTime must be after StartTime
- No overlapping work logs for same user
- Cannot log time on completed/cancelled tasks (configurable)
- Maximum single session: 12 hours

**APIs:**
| Method | Endpoint                                    | Auth | Roles               |
|--------|---------------------------------------------|------|----------------------|
| POST   | /api/worklogs                               | Yes  | All                  |
| GET    | /api/worklogs/task/{taskId}                 | Yes  | All                  |
| GET    | /api/worklogs/employee/{userId}             | Yes  | Admin, Manager, Self |
| GET    | /api/worklogs/employee/{userId}/summary     | Yes  | Admin, Manager, Self |
| GET    | /api/worklogs/employee/{userId}/weekly       | Yes  | Admin, Manager, Self |
| PUT    | /api/worklogs/{id}                          | Yes  | Self                 |
| DELETE | /api/worklogs/{id}                          | Yes  | Self, Admin          |

#### 4.2 Frontend Implementation

**Components:**
- `WorkLogForm` — Time entry form with task selector, datetime pickers
- `WorkLogList` — Table of logged hours with edit/delete
- `TimeTracker` — Active timer widget (start/stop, auto-calculate duration)

**Features:**
- Running timer that can be started/stopped
- Manual time entry (for past work)
- Weekly timesheet view (grid: days × tasks)
- Quick-log from task detail page

---

### MODULE 5: Manager Search & Reporting Dashboard

#### 5.1 Backend Implementation

**DTO: `ManagerDashboardDto`**
```csharp
public class ManagerDashboardDto
{
    public UserDto Manager { get; set; }
    public List<TeamReportDto> Teams { get; set; }
    public ManagerSummaryDto Summary { get; set; }
}

public class TeamReportDto
{
    public string TeamName { get; set; }
    public List<EmployeeReportDto> Employees { get; set; }
    public decimal TeamProductivity { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
}

public class EmployeeReportDto
{
    public UserDto Employee { get; set; }
    public List<TaskDto> Tasks { get; set; }
    public decimal TotalHoursSpent { get; set; }
    public decimal CompletionPercentage { get; set; }
}

public class ManagerSummaryDto
{
    public int TotalTeams { get; set; }
    public int TotalEmployees { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public decimal OverallProductivity { get; set; }
}
```

**APIs:**
| Method | Endpoint                                     | Auth | Roles              |
|--------|---------------------------------------------|------|--------------------|
| GET    | /api/managers/search?q={query}              | Yes  | Admin, Manager, HR |
| GET    | /api/managers/{id}/dashboard                | Yes  | Admin, Manager(self) |
| GET    | /api/managers/{id}/hierarchy                | Yes  | All                |
| GET    | /api/managers/{id}/team-report              | Yes  | Admin, Manager, HR |

#### 5.2 Frontend Implementation

**Pages:**
- `ManagerSearchPage` — Search input, results list, click to expand
- `ManagerDashboard` — Full dashboard with team cards, hierarchy tree

**Features:**
- Expandable tree view with employee cards
- Per-employee task list expandable sections
- Team productivity summary cards
- Click-through to individual employee detail

---

### MODULE 6: Performance Analytics

#### 6.1 Backend Implementation

**DTOs:**
```csharp
public class TaskCompletionRateDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public decimal CompletionRate { get; set; } // percentage
}

public class AvgCompletionTimeDto
{
    public decimal AvgHours { get; set; }
    public decimal AvgDays { get; set; }
}

public class ProductivityScoreDto
{
    public int UserId { get; set; }
    public string EmployeeName { get; set; }
    public decimal Score { get; set; } // 0-100
    // Formula: (CompletedOnTime / TotalAssigned) * 100
    //          weighted by priority
}

public class TeamComparisonDto
{
    public string TeamName { get; set; }
    public decimal AvgCompletionRate { get; set; }
    public decimal AvgProductivityScore { get; set; }
    public int TotalTasks { get; set; }
}

public class WeeklyProductivityDto
{
    public string WeekLabel { get; set; }       // "2026-W05"
    public decimal HoursWorked { get; set; }
    public int TasksCompleted { get; set; }
}
```

**Services: `AnalyticsService`**
- `GetTaskCompletionRate(userId?, teamId?, dateRange)` → Completion rate
- `GetAverageCompletionTime(userId?, teamId?)` → Avg time to complete
- `GetProductivityScores(teamId?)` → Per-employee scores
- `GetTeamComparison()` → All teams compared
- `GetWeeklyProductivity(userId, weeks)` → Weekly trend data
- `GetTaskDistributionByStatus(teamId?)` → Status breakdown
- `GetTaskDistributionByPriority(teamId?)` → Priority breakdown

**Productivity Score Formula:**
```
Score = (CompletedOnTime / TotalAssigned) × 100

Where:
  CompletedOnTime = tasks completed before or on deadline
  TotalAssigned   = all tasks ever assigned

Weighted variant:
  WeightedScore = Σ(PriorityWeight × OnTimeCompletion) / Σ(PriorityWeight)
  PriorityWeight: High=3, Medium=2, Low=1
```

**APIs:**
| Method | Endpoint                                        | Auth | Roles              |
|--------|------------------------------------------------|------|--------------------|
| GET    | /api/analytics/completion-rate                  | Yes  | Admin, Manager, HR |
| GET    | /api/analytics/avg-completion-time              | Yes  | Admin, Manager, HR |
| GET    | /api/analytics/productivity-scores              | Yes  | Admin, Manager, HR |
| GET    | /api/analytics/team-comparison                  | Yes  | Admin, Manager, HR |
| GET    | /api/analytics/weekly-productivity/{userId}     | Yes  | Admin, Manager, Self |
| GET    | /api/analytics/task-distribution                | Yes  | Admin, Manager, HR |

#### 6.2 Frontend Implementation

**Charts (using Recharts):**
- `TaskBarChart` — Bar chart: tasks per employee (completed vs pending)
- `StatusPieChart` — Pie chart: task status distribution
- `WeeklyLineChart` — Line chart: weekly hours/tasks over time
- `TeamComparisonChart` — Grouped bar chart comparing teams

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────┐
│  KPI Cards: Total Tasks | Completion Rate | Avg Time│
├──────────────────────┬──────────────────────────────┤
│  Task Bar Chart      │  Status Pie Chart            │
│  (per employee)      │  (Pending/InProgress/Done)   │
├──────────────────────┴──────────────────────────────┤
│  Weekly Productivity Line Chart                     │
├─────────────────────────────────────────────────────┤
│  Team Comparison Table / Chart                      │
└─────────────────────────────────────────────────────┘
```

---

### MODULE 7: Notification & Reminder

#### 7.1 Backend Implementation

**Entity: `Notification`**
- NotificationId, UserId, Title, Message, Type (enum), IsRead, RelatedTaskId, CreatedDate

**Enum: `NotificationType`**
```csharp
public enum NotificationType
{
    Info = 0,
    TaskAssigned = 1,
    DeadlineReminder = 2,
    TaskOverdue = 3,
    ManagerAlert = 4
}
```

**Services:**
- `NotificationService`
  - `CreateNotification(userId, title, message, type, taskId?)` → Store in DB
  - `GetUserNotifications(userId, unreadOnly?)` → User's notifications
  - `MarkAsRead(notificationId)` → Mark single
  - `MarkAllAsRead(userId)` → Mark all
  - `GetUnreadCount(userId)` → Badge count

- `EmailService`
  - `SendTaskAssignmentEmail(assigneeEmail, taskDetails)` → On task creation
  - `SendDeadlineReminderEmail(assigneeEmail, taskDetails)` → 24h before deadline
  - `SendOverdueAlertEmail(assigneeEmail, managerEmail, taskDetails)` → On overdue

**Background Jobs (Hangfire):**
```csharp
// 1. Overdue Task Checker — every 15 minutes
RecurringJob.AddOrUpdate<OverdueTaskJob>(
    "check-overdue-tasks",
    job => job.Execute(),
    "*/15 * * * *"
);

// 2. Deadline Reminder — daily at 8 AM
RecurringJob.AddOrUpdate<ReminderJob>(
    "deadline-reminders",
    job => job.SendReminders(),
    "0 8 * * *"
);
```

**APIs:**
| Method | Endpoint                              | Auth | Roles |
|--------|--------------------------------------|------|-------|
| GET    | /api/notifications                   | Yes  | All   |
| GET    | /api/notifications/unread-count      | Yes  | All   |
| PATCH  | /api/notifications/{id}/read         | Yes  | All   |
| PATCH  | /api/notifications/read-all          | Yes  | All   |

#### 7.2 Frontend Implementation

**Components:**
- `NotificationBell` — Header icon with unread count badge
- `NotificationList` — Dropdown/panel listing all notifications
- Toast notifications for real-time alerts (react-hot-toast)

---

### MODULE 8: Intelligent Workload Balancing

#### 8.1 Backend Implementation

**DTOs:**
```csharp
public class WorkloadDto
{
    public int UserId { get; set; }
    public string EmployeeName { get; set; }
    public int ActiveTaskCount { get; set; }
    public decimal TotalEstimatedHours { get; set; }
    public decimal MaxCapacityHours { get; set; }
    public decimal WorkloadPercentage { get; set; }
    // Formula: (TotalEstimatedHours / MaxCapacityHours) * 100
}

public class WorkloadRecommendationDto
{
    public List<WorkloadDto> TeamWorkload { get; set; }
    public WorkloadDto RecommendedEmployee { get; set; }
    public string RecommendationMessage { get; set; }
    // e.g., "Employee A: 40% workload — Recommended"
}
```

**Services: `WorkloadService`**
```csharp
public async Task<WorkloadRecommendationDto> GetRecommendation(int teamId, decimal estimatedHours)
{
    // 1. Get all active members in team
    // 2. For each member:
    //    a. Count active (non-completed) tasks
    //    b. Sum EstimatedHours of active tasks
    //    c. Get MaxCapacityHours from user profile
    //    d. Calculate: WorkloadPct = (CurrentHours / MaxCapacity) * 100
    //    e. Project: NewWorkloadPct = ((CurrentHours + estimatedHours) / MaxCapacity) * 100
    // 3. Sort by projected WorkloadPct ascending
    // 4. Recommend employee with lowest projected workload
    // 5. Return full team workload + recommendation
}
```

**APIs:**
| Method | Endpoint                                       | Auth | Roles                    |
|--------|-----------------------------------------------|------|--------------------------|
| GET    | /api/workload/team/{teamId}                   | Yes  | Admin, Manager, TeamLead |
| GET    | /api/workload/employee/{userId}               | Yes  | Admin, Manager, Self     |
| GET    | /api/workload/recommend/{teamId}?hours={est}  | Yes  | Admin, Manager, TeamLead |

#### 8.2 Frontend Implementation

**Components:**
- `WorkloadGauge` — Visual gauge/progress bar per employee (color: green <50%, yellow 50-80%, red >80%)
- `RecommendationPanel` — Shows recommendation when creating a task

**Integration with Task Form:**
- When creating a task and selecting a team, auto-fetch workload recommendation
- Display ranked employee list with workload indicators
- Pre-select recommended (lowest workload) employee

---

## 7. Phase-wise Development Timeline

### Phase 1: Foundation (Week 1-2)
| # | Task | Duration |
|---|------|----------|
| 1 | Project scaffolding — Solution structure, NuGet packages, npm packages | 1 day |
| 2 | Database design — EF Core entities, configurations, migrations | 2 days |
| 3 | Generic repository + Unit of Work pattern | 1 day |
| 4 | Global exception handling middleware | 0.5 day |
| 5 | Logging setup (Serilog) | 0.5 day |
| 6 | AutoMapper profiles | 0.5 day |
| 7 | Swagger configuration | 0.5 day |
| 8 | Frontend scaffolding — Vite + React + Tailwind + Routing | 1 day |
| 9 | Axios instance + interceptors | 0.5 day |
| 10 | Common UI components (Button, Modal, Table, Card, etc.) | 1.5 days |
| 11 | Database seed data | 0.5 day |

### Phase 2: Authentication & Users (Week 2-3)
| # | Task | Duration |
|---|------|----------|
| 1 | User & Role entities completion + EF configuration | 1 day |
| 2 | JWT service implementation | 1 day |
| 3 | Auth controller (login, register, refresh) | 1 day |
| 4 | User CRUD service + controller | 1 day |
| 5 | Role-based authorization middleware | 0.5 day |
| 6 | Login page + auth context | 1 day |
| 7 | Protected routes + role-based rendering | 0.5 day |
| 8 | Admin user management page | 1 day |
| 9 | Dashboard shell (role-aware) | 1 day |

### Phase 3: Teams & Hierarchy (Week 3-4)
| # | Task | Duration |
|---|------|----------|
| 1 | Team entities + EF configuration | 0.5 day |
| 2 | Team service (CRUD, member management) | 1.5 days |
| 3 | Hierarchy query (recursive CTE / LINQ) | 1 day |
| 4 | Team controller + APIs | 1 day |
| 5 | Team management frontend pages | 1.5 days |
| 6 | Hierarchy tree component (recursive React) | 1.5 days |
| 7 | Manager search frontend | 1 day |

### Phase 4: Task Management (Week 4-5)
| # | Task | Duration |
|---|------|----------|
| 1 | Task entity + EF configuration | 0.5 day |
| 2 | Task service (CRUD, filters, status) | 2 days |
| 3 | Task controller + APIs | 1 day |
| 4 | Auto-overdue background job | 0.5 day |
| 5 | Task list page with filters | 1.5 days |
| 6 | Task create/edit form | 1 day |
| 7 | Task detail page | 0.5 day |
| 8 | Status badge + priority indicators | 0.5 day |

### Phase 5: Time Tracking (Week 5-6)
| # | Task | Duration |
|---|------|----------|
| 1 | WorkLog entity + EF configuration | 0.5 day |
| 2 | WorkLog service (CRUD, summaries) | 1.5 days |
| 3 | WorkLog controller + APIs | 1 day |
| 4 | Time logging page | 1.5 days |
| 5 | Timer widget component | 1 day |
| 6 | Weekly summary views | 0.5 day |

### Phase 6: Analytics & Reporting (Week 6-7)
| # | Task | Duration |
|---|------|----------|
| 1 | Analytics service (all metrics) | 2 days |
| 2 | Analytics controller + APIs | 1 day |
| 3 | Manager search & reporting APIs | 1 day |
| 4 | Analytics dashboard page | 2 days |
| 5 | Charts (bar, pie, line, comparison) | 2 days |
| 6 | Manager reporting dashboard frontend | 1.5 days |

### Phase 7: Notifications (Week 7-8)
| # | Task | Duration |
|---|------|----------|
| 1 | Notification entity + service | 1 day |
| 2 | Email service (MailKit) | 1 day |
| 3 | Hangfire setup + background jobs | 1 day |
| 4 | Notification controller + APIs | 0.5 day |
| 5 | Notification bell + dropdown UI | 1 day |
| 6 | Reminder & overdue jobs testing | 0.5 day |

### Phase 8: Workload Balancing (Week 8-9)
| # | Task | Duration |
|---|------|----------|
| 1 | Workload calculation service | 1 day |
| 2 | Recommendation engine | 1 day |
| 3 | Workload controller + APIs | 0.5 day |
| 4 | Workload visualization components | 1 day |
| 5 | Integration with task creation form | 0.5 day |

### Phase 9: Polish & Testing (Week 9-10)
| # | Task | Duration |
|---|------|----------|
| 1 | Unit tests — services | 2 days |
| 2 | Integration tests — API endpoints | 2 days |
| 3 | Frontend testing (React Testing Library) | 1.5 days |
| 4 | UI polish, responsive design | 1.5 days |
| 5 | Performance optimization (indexes, query optimization) | 1 day |
| 6 | Security audit (XSS, CSRF, SQL injection) | 0.5 day |
| 7 | Documentation & README | 0.5 day |
| 8 | Deployment configuration | 1 day |

---

## 8. API Endpoint Catalog (Complete)

### Authentication (Public)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
```

### Users (Admin, HR)
```
GET    /api/users                          [Admin, HR]
GET    /api/users/{id}                     [Admin, HR]
POST   /api/users                          [Admin]
PUT    /api/users/{id}                     [Admin]
PATCH  /api/users/{id}/status              [Admin]
PUT    /api/users/{id}/roles               [Admin]
GET    /api/users/me                       [All]
GET    /api/roles                          [Admin]
```

### Teams
```
GET    /api/teams                          [Admin, Manager]
GET    /api/teams/{id}                     [All]
POST   /api/teams                          [Admin]
PUT    /api/teams/{id}                     [Admin, Manager]
POST   /api/teams/{id}/members             [Admin, Manager]
DELETE /api/teams/{id}/members/{userId}    [Admin, Manager]
GET    /api/teams/{id}/members             [All]
GET    /api/teams/hierarchy/{managerId}    [All]
GET    /api/teams/manager-search           [Admin, Manager, HR]
```

### Tasks
```
GET    /api/tasks                          [All]
GET    /api/tasks/{id}                     [All]
POST   /api/tasks                          [Admin, Manager, TeamLead]
PUT    /api/tasks/{id}                     [Admin, Manager, TeamLead]
PATCH  /api/tasks/{id}/status              [All - own tasks]
GET    /api/tasks/employee/{employeeId}    [Admin, Manager, Self]
GET    /api/tasks/manager/{managerId}      [Admin, Manager(self)]
GET    /api/tasks/team/{teamId}            [Admin, Manager, TeamLead]
DELETE /api/tasks/{id}                     [Admin, Manager]
```

### Work Logs
```
POST   /api/worklogs                       [All]
GET    /api/worklogs/task/{taskId}         [All]
GET    /api/worklogs/employee/{userId}     [Admin, Manager, Self]
GET    /api/worklogs/employee/{userId}/summary   [Admin, Manager, Self]
GET    /api/worklogs/employee/{userId}/weekly    [Admin, Manager, Self]
PUT    /api/worklogs/{id}                  [Self]
DELETE /api/worklogs/{id}                  [Self, Admin]
```

### Managers
```
GET    /api/managers/search                [Admin, Manager, HR]
GET    /api/managers/{id}/dashboard        [Admin, Manager(self)]
GET    /api/managers/{id}/hierarchy        [All]
GET    /api/managers/{id}/team-report      [Admin, Manager, HR]
```

### Analytics
```
GET    /api/analytics/completion-rate      [Admin, Manager, HR]
GET    /api/analytics/avg-completion-time  [Admin, Manager, HR]
GET    /api/analytics/productivity-scores  [Admin, Manager, HR]
GET    /api/analytics/team-comparison      [Admin, Manager, HR]
GET    /api/analytics/weekly-productivity/{userId}  [Admin, Manager, Self]
GET    /api/analytics/task-distribution    [Admin, Manager, HR]
```

### Notifications
```
GET    /api/notifications                  [All]
GET    /api/notifications/unread-count     [All]
PATCH  /api/notifications/{id}/read        [All]
PATCH  /api/notifications/read-all         [All]
```

### Workload
```
GET    /api/workload/team/{teamId}         [Admin, Manager, TeamLead]
GET    /api/workload/employee/{userId}     [Admin, Manager, Self]
GET    /api/workload/recommend/{teamId}    [Admin, Manager, TeamLead]
```

**Total: 45 API endpoints**

---

## 9. Security Strategy

### 9.1 Authentication
- JWT Bearer tokens with HMAC-SHA256 signing
- Access token: 60-minute expiry
- Refresh token: 7-day expiry, stored server-side with rotation
- Password hashing: BCrypt (work factor 12)
- Account lockout after 5 failed attempts (15-minute cooldown)

### 9.2 Authorization
- Role-based authorization attributes on controllers/actions
- Custom authorization policies for resource-level access (e.g., only view own tasks)
- Middleware validates JWT on every request to protected endpoints

### 9.3 Input Validation
- FluentValidation for all request DTOs
- Model validation filter in API pipeline
- Parameterized queries via EF Core (prevents SQL injection)
- Input sanitization for user-facing text fields

### 9.4 CORS
- Restrict origins to frontend domain only
- Allow only specific HTTP methods and headers
- Credentials mode enabled for cookie-based refresh tokens

### 9.5 Frontend Security
- JWT stored in memory (React state), NOT in localStorage
- Refresh token via httpOnly secure cookie
- Axios interceptors for automatic token refresh on 401
- Route guards (ProtectedRoute component) check auth state
- Role-based component rendering

---

## 10. Testing Strategy

### 10.1 Backend Unit Tests
- **Framework:** xUnit + Moq + FluentAssertions
- **Coverage targets:**
  - Service layer: 80%+ coverage
  - Business logic methods: 100% coverage
  - Validators: 100% coverage

- **Test categories:**
  - AuthService: registration, login, token generation, refresh
  - TaskService: create, status transitions, overdue logic
  - WorkloadService: calculation accuracy, recommendation correctness
  - AnalyticsService: metric calculations, edge cases

### 10.2 Backend Integration Tests
- **Framework:** xUnit + WebApplicationFactory + TestContainers (SQL Server)
- **Coverage:** All 45 API endpoints
- **Focus:** Auth flow, RBAC enforcement, CRUD operations, error responses

### 10.3 Frontend Tests
- **Framework:** Vitest + React Testing Library
- **Coverage targets:**
  - Components: 70%+
  - Auth flow: 100%
  - Route guards: 100%

---

## 11. Deployment Plan

### 11.1 Development Environment
```
Backend:    dotnet run (Kestrel, port 5000/5001)
Frontend:   npm run dev (Vite dev server, port 5173)
Database:   SQL Server LocalDB or Docker container
```

### 11.2 Production Architecture
```
                    ┌──────────────┐
                    │  Nginx/IIS   │  (Reverse Proxy + Static Files)
                    │  Port 80/443 │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼──────────┐  ┌──────────▼───────────┐
    │  React (Static)    │  │  ASP.NET Core API    │
    │  /dist served by   │  │  Port 5000           │
    │  Nginx             │  │  Kestrel             │
    └────────────────────┘  └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  SQL Server          │
                            │  Port 1433           │
                            └──────────────────────┘
```

### 11.3 Docker Compose (Optional)
```yaml
services:
  api:
    build: ./src/TaskManager.API
    ports: ["5000:5000"]
    depends_on: [db]
  
  client:
    build: ./taskmanager-client
    ports: ["80:80"]
  
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    ports: ["1433:1433"] 
  
  hangfire:
    # Runs as part of API or separate worker
```

### 11.4 Configuration Checklist
- [ ] Connection strings (appsettings.Production.json)
- [ ] JWT secrets via environment variables / Azure Key Vault
- [ ] CORS origins configured for production domain
- [ ] HTTPS enforced
- [ ] Serilog sinks (file, Seq, or Application Insights)
- [ ] Hangfire dashboard secured (admin only)
- [ ] EF Core migrations applied
- [ ] Seed data for roles

---

## Summary

| Metric                | Value          |
|-----------------------|----------------|
| Total Modules         | 8              |
| API Endpoints         | 45             |
| Database Tables       | 7              |
| Backend Projects      | 4 (API, Application, Domain, Infrastructure) |
| Frontend Pages        | ~15            |
| Frontend Components   | ~35            |
| Estimated Duration    | 9-10 weeks     |
| Architecture          | Layered (Controller → Service → Repository → DB) |
| Auth                  | JWT + RBAC     |
| Background Jobs       | 2 recurring (Hangfire) |

---

*This implementation plan serves as the blueprint for building the complete system. Each module is designed to be developed incrementally, with dependencies flowing naturally from Phase 1 through Phase 9.*
