# ChatGPT Prompt – Draw DFD Level 0 & Level 1 for CogniStruct Task Management System

> **How to use**: Copy the entire content below (starting from the `---` line) and paste it into ChatGPT. It will guide you step-by-step to draw both the DFD Level 0 (Context Diagram) and the DFD Level 1 diagram using correct DFD notation.

---

## PROMPT START

I need your help to **draw Data Flow Diagrams (DFD) — Level 0 (Context Diagram) and Level 1** for my project documentation. Please guide me step-by-step, including what shapes to use, what labels to write, and where to draw each arrow.

---

### SECTION 1: PROJECT OVERVIEW

**Project Name:** CogniStruct – Intelligent Task Management System  
**Technology Stack:**
- **Frontend:** React 19 + Vite 7 (Single Page Application)
- **Backend:** ASP.NET Core 9.0 Web API (RESTful)
- **Database:** Microsoft SQL Server (via Entity Framework Core)
- **Authentication:** JWT (JSON Web Token) with Refresh Tokens

**System Description:**  
CogniStruct is a role-based, multi-tier task management web application that enables organizations to manage projects, assign & track tasks, monitor employee workload, perform analytics, and facilitate team collaboration. The system supports four distinct user roles with permission-based access control.

---

### SECTION 2: EXTERNAL ENTITIES (Actors)

The system interacts with the following **four external entities** (actors/users):

| # | External Entity | Role Description |
|---|----------------|------------------|
| 1 | **Admin** | System administrator. Manages users (CRUD), assigns roles, monitors all system activity, views global analytics & audit logs. |
| 2 | **Manager** | Creates & manages projects, creates teams, assigns Team Leads, views team analytics, submits employee performance reviews, approves/rejects pause requests. |
| 3 | **Team Lead** | Manages assigned projects, creates & assigns tasks/subtasks to employees, monitors task progress, provides task feedback (ratings), views team workload analytics, handles approval queues for pause requests. |
| 4 | **Employee** | Views assigned tasks, updates task status, logs work hours (WorkLogs), adds comments & attachments to tasks, views personal dashboard & progress, manages own profile & settings, submits pause requests. |

---

### SECTION 3: DATA STORES (Database Tables)

The system uses the following **data stores** (each corresponds to a database table):

| # | Data Store ID | Data Store Name | Key Fields |
|---|--------------|-----------------|------------|
| D1 | Users | User Data Store | UserId, FirstName, LastName, Email, PasswordHash, IsActive, Skills, ManagerId, ProfileImageUrl |
| D2 | Roles / UserRoles | Role Data Store | RoleId, RoleName; UserRoleId, UserId, RoleId |
| D3 | Projects | Project Data Store | ProjectId, Name, Description, CreatedByManagerId, LeadId, Status, TeamId |
| D4 | Tasks | Task Data Store | TaskId, Title, Description, AssigneeId, AssignerId, Priority, Status, Deadline, EstimatedHours, ProjectId, ParentTaskId, SlaHours, SlaBreached, RequiredSkills |
| D5 | Teams / TeamMembers | Team Data Store | TeamId, TeamName, ManagerId; TeamMemberId, TeamId, UserId |
| D6 | ProjectMembers | Project Member Data Store | ProjectMemberId, ProjectId, UserId |
| D7 | WorkLogs | Work Log Data Store | WorkLogId, TaskId, UserId, StartTime, EndTime, TotalHours |
| D8 | Notifications | Notification Data Store | NotificationId, UserId, Title, Type, Message, IsRead |
| D9 | TaskComments | Task Comment Data Store | CommentId, TaskId, UserId, Message |
| D10 | TaskAttachments | Task Attachment Data Store | AttachmentId, TaskId, FileName, FilePath, FileSize, UploadedByUserId |
| D11 | TaskFeedback | Task Feedback Data Store | FeedbackId, TaskId, EmployeeId, TeamLeadId, WorkQualityRating, TimelinessRating, CommunicationRating, OverallRating |
| D12 | EmployeeReviews | Employee Review Data Store | ReviewId, EmployeeId, ManagerId, ReviewPeriod, PerformanceScore |
| D13 | PauseRequests | Pause Request Data Store | Id, TaskId, EmployeeId, RequestedByUserId, Reason, Status, IsSystemGenerated, ApprovedByUserId |
| D14 | TaskAuditLogs | Audit Log Data Store | AuditId, TaskId, PerformedByUserId, Action, Details |
| D15 | SkillUsage | Skill Usage Data Store | SkillUsageId, EmployeeId, Skill, TaskId, CompletedSuccessfully |
| D16 | UserSettings | User Settings Data Store | SettingsId, UserId, TimeZone, Theme, NotificationPreferences |

---

### SECTION 4: DFD NOTATION RULES & SHAPES

Please use the standard **Yourdon-DeMarco DFD notation**. Here are the exact shapes and rules:

| Shape | DFD Element | How to Draw | Rule |
|-------|-----------|-------------|------|
| **Rectangle** (square box) | **External Entity** (Actor) | Draw a rectangle with the entity name inside (e.g., "Admin", "Manager") | Placed OUTSIDE the system boundary. Represents sources/sinks of data. |
| **Circle** (rounded circle / bubble) | **Process** | Draw a circle (or rounded rectangle) with a number and process name inside (e.g., "1.0 Authentication") | Represents a data transformation or processing step. Must have at least one input and one output flow. |
| **Open-ended Rectangle** (two horizontal parallel lines) | **Data Store** | Draw two parallel horizontal lines with the data store ID and name (e.g., "D1 \| Users") | Represents stored data. Only connected to Processes, NEVER directly to External Entities. |
| **Arrow** (directed line with label) | **Data Flow** | Draw an arrow from source to destination with a label describing the data (e.g., "Login Credentials") | Represents movement of data. Must be labelled. Arrows go FROM a source TO a destination. |

**Key DFD Rules:**
1. ❌ **No data flow between two External Entities** — data must pass through a Process.
2. ❌ **No data flow between two Data Stores** — data must pass through a Process.
3. ❌ **No data flow directly from External Entity to Data Store** — must go through a Process.
4. ✅ Every Process must have **at least one input and one output**.
5. ✅ Data Stores can only connect to Processes (read/write).
6. ✅ Data flows must be **labeled** with meaningful names.
7. ✅ Level 0 has exactly **one single process** (the system). Level 1 decomposes it.

---

### SECTION 5: DFD LEVEL 0 — CONTEXT DIAGRAM

**Instructions:** Draw ONE circle in the center representing the entire system. Place all four External Entities as rectangles around it. Draw labelled arrows showing all major data flows between each entity and the system.

```
LEVEL 0 — CONTEXT DIAGRAM
==========================

Central Process (Circle):
   "0.0 CogniStruct Task Management System"

External Entities (Rectangles) and their Data Flows (Arrows):
```

#### External Entity: Admin
| Direction | Data Flow Label |
|-----------|----------------|
| Admin → System | User Registration Data, Role Assignment Data, User Activation/Deactivation Request |
| System → Admin | User List, Role List, All Analytics Reports, System Audit Logs |

#### External Entity: Manager
| Direction | Data Flow Label |
|-----------|----------------|
| Manager → System | Login Credentials, Project Details, Team Details, Team Lead Assignment, Task Creation Data, Employee Review Data, Pause Request Approval/Rejection |
| System → Manager | JWT Token, Project List, Team List, Task Status Reports, Team Analytics, Employee Performance Data, Notifications, Pause Request List |

#### External Entity: Team Lead
| Direction | Data Flow Label |
|-----------|----------------|
| Team Lead → System | Login Credentials, Task/Subtask Assignment Data, Task Feedback Ratings, Pause Request Approval/Rejection, Task Status Updates |
| System → Team Lead | JWT Token, Assigned Projects & Tasks, Team Member List, Workload Analytics, Skill Analytics, Approval Queue Data, Notifications |

#### External Entity: Employee
| Direction | Data Flow Label |
|-----------|----------------|
| Employee → System | Login Credentials, Task Status Updates, Work Log Entries, Task Comments, Task Attachments, Pause Request Submission, Profile Updates, Settings Preferences |
| System → Employee | JWT Token, Assigned Tasks List, Task Details, Work Log Summary, Progress Reports, Notifications, Profile Data, Settings Data |

---

### SECTION 6: DFD LEVEL 1 — DETAILED DECOMPOSITION

**Instructions:** Decompose the single Level 0 process into the following **8 sub-processes**. Place all External Entities on the outer edges. Place all Data Stores along the bottom or sides. Connect everything with labelled data flow arrows.

```
LEVEL 1 PROCESSES:
  1.0  User Authentication & Authorization
  2.0  User & Role Management
  3.0  Project Management
  4.0  Task Management
  5.0  Team Management
  6.0  Work Tracking & Logging
  7.0  Notifications & Communication
  8.0  Analytics & Reporting
```

---

#### PROCESS 1.0: User Authentication & Authorization

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Manager / Team Lead / Employee → Process 1.0 | Login Credentials (Email, Password) |
| Read | Process 1.0 → D1 (Users) | Verify User Data |
| Read | Process 1.0 → D2 (Roles) | Fetch User Roles |
| Write | Process 1.0 → D1 (Users) | Store Refresh Token |
| Output | Process 1.0 → Manager / Team Lead / Employee | JWT Access Token + Refresh Token |
| Output | Process 1.0 → Manager / Team Lead / Employee | Authentication Error Message |

---

#### PROCESS 2.0: User & Role Management

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Admin → Process 2.0 | User Registration Data (Name, Email, Password) |
| Input | Admin → Process 2.0 | Role Assignment Data (UserId, RoleId) |
| Input | Admin → Process 2.0 | User Activation/Deactivation Request |
| Input | Employee / Manager / Team Lead → Process 2.0 | Profile Update Data (Bio, Skills, Phone, Image) |
| Input | Employee / Manager / Team Lead → Process 2.0 | Settings Preferences (Theme, Timezone, Notification prefs) |
| Write | Process 2.0 → D1 (Users) | Store/Update User Record |
| Write | Process 2.0 → D2 (Roles/UserRoles) | Store Role Assignment |
| Write | Process 2.0 → D16 (UserSettings) | Store Settings Data |
| Read | Process 2.0 → D1 (Users) | Fetch User List / Profile |
| Read | Process 2.0 → D2 (Roles) | Fetch Available Roles |
| Read | Process 2.0 → D16 (UserSettings) | Fetch User Settings |
| Output | Process 2.0 → Admin | User List, Confirmation Message |
| Output | Process 2.0 → Employee / Manager / Team Lead | Profile Data, Settings Data |

---

#### PROCESS 3.0: Project Management

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Manager → Process 3.0 | Project Details (Name, Description, TeamId) |
| Input | Manager → Process 3.0 | Project Lead Assignment (LeadId) |
| Input | Manager / Team Lead → Process 3.0 | Project Member Addition (UserId) |
| Write | Process 3.0 → D3 (Projects) | Store/Update Project Record |
| Write | Process 3.0 → D6 (ProjectMembers) | Store Project Member Mapping |
| Read | Process 3.0 → D3 (Projects) | Fetch Project List/Details |
| Read | Process 3.0 → D6 (ProjectMembers) | Fetch Project Members |
| Read | Process 3.0 → D5 (Teams) | Fetch Team Data for Project |
| Output | Process 3.0 → Manager | Project List, Project Details, Confirmation |
| Output | Process 3.0 → Team Lead | Assigned Project Details |
| Output | Process 3.0 → Employee | Project Details (via membership) |

---

#### PROCESS 4.0: Task Management

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Manager / Team Lead → Process 4.0 | Task Creation Data (Title, Description, Priority, Deadline, AssigneeId, ProjectId, RequiredSkills) |
| Input | Manager / Team Lead → Process 4.0 | Subtask Creation Data (ParentTaskId) |
| Input | Employee → Process 4.0 | Task Status Update (InProgress, Completed) |
| Input | Employee → Process 4.0 | Task Comment (Message) |
| Input | Employee / Team Lead → Process 4.0 | Task Attachment (File Upload) |
| Input | Employee → Process 4.0 | Pause Request Submission (Reason) |
| Input | Manager / Team Lead → Process 4.0 | Pause Request Approval/Rejection |
| Input | Team Lead → Process 4.0 | Task Feedback (Quality, Timeliness, Communication Ratings) |
| Write | Process 4.0 → D4 (Tasks) | Store/Update Task Record |
| Write | Process 4.0 → D9 (TaskComments) | Store Comment |
| Write | Process 4.0 → D10 (TaskAttachments) | Store Attachment Metadata |
| Write | Process 4.0 → D11 (TaskFeedback) | Store Feedback Ratings |
| Write | Process 4.0 → D13 (PauseRequests) | Store/Update Pause Request |
| Write | Process 4.0 → D14 (TaskAuditLogs) | Store Audit Trail Entry |
| Write | Process 4.0 → D15 (SkillUsage) | Record Skill Usage on Completion |
| Read | Process 4.0 → D4 (Tasks) | Fetch Task List/Details/Subtasks |
| Read | Process 4.0 → D3 (Projects) | Fetch Parent Project Info |
| Read | Process 4.0 → D1 (Users) | Fetch Assignee/Assigner Info |
| Read | Process 4.0 → D13 (PauseRequests) | Fetch Pending Pause Requests |
| Output | Process 4.0 → Manager | Task List, Task Status, Approval Queue |
| Output | Process 4.0 → Team Lead | Task List, Subtask Details, Approval Queue, Feedback Confirmation |
| Output | Process 4.0 → Employee | Assigned Tasks, Task Details, Comments, Attachment Links |

---

#### PROCESS 5.0: Team Management

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Manager → Process 5.0 | Team Details (TeamName, Description) |
| Input | Manager → Process 5.0 | Team Member Addition/Removal (UserId) |
| Input | Manager → Process 5.0 | Team Manager/Lead Assignment |
| Write | Process 5.0 → D5 (Teams) | Store/Update Team Record |
| Write | Process 5.0 → D5 (TeamMembers) | Store Team Member Mapping |
| Read | Process 5.0 → D5 (Teams/TeamMembers) | Fetch Team List/Members |
| Read | Process 5.0 → D1 (Users) | Fetch Available Users for Assignment |
| Output | Process 5.0 → Manager | Team List, Team Details, Member List |
| Output | Process 5.0 → Team Lead | Team Members assigned to lead |

---

#### PROCESS 6.0: Work Tracking & Logging

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Employee → Process 6.0 | Work Log Entry (TaskId, StartTime, EndTime, Description) |
| Input | Manager → Process 6.0 | Employee Review Data (PerformanceScore, Strengths, Improvements, ReviewPeriod) |
| Write | Process 6.0 → D7 (WorkLogs) | Store Work Log Record |
| Write | Process 6.0 → D12 (EmployeeReviews) | Store Employee Review |
| Read | Process 6.0 → D7 (WorkLogs) | Fetch Work Log History |
| Read | Process 6.0 → D4 (Tasks) | Fetch Task Details for Work Log Context |
| Read | Process 6.0 → D12 (EmployeeReviews) | Fetch Employee Reviews |
| Output | Process 6.0 → Employee | Work Log Summary, Hours Tracked |
| Output | Process 6.0 → Manager | Employee Work Log Reports, Review History |
| Output | Process 6.0 → Team Lead | Team Work Log Summary |

---

#### PROCESS 7.0: Notifications & Communication

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input (trigger) | Process 4.0 (Task Mgmt) → Process 7.0 | Task Assignment/Status Change Event |
| Input (trigger) | Process 3.0 (Project Mgmt) → Process 7.0 | Project Update Event |
| Input (trigger) | Process 4.0 (Task Mgmt) → Process 7.0 | Pause Request Event |
| Input | Employee / Manager / Team Lead → Process 7.0 | Mark Notification as Read |
| Write | Process 7.0 → D8 (Notifications) | Store Notification Record |
| Read | Process 7.0 → D8 (Notifications) | Fetch User Notifications |
| Read | Process 7.0 → D16 (UserSettings) | Check Notification Preferences |
| Output | Process 7.0 → Manager | Notification Alerts |
| Output | Process 7.0 → Team Lead | Notification Alerts |
| Output | Process 7.0 → Employee | Notification Alerts |

---

#### PROCESS 8.0: Analytics & Reporting

| Data Flow | Source → Destination | Arrow Label |
|-----------|---------------------|-------------|
| Input | Admin / Manager / Team Lead → Process 8.0 | Analytics Request (Filters, Date Range) |
| Read | Process 8.0 → D4 (Tasks) | Fetch Task Data (Status, Completion, SLA) |
| Read | Process 8.0 → D7 (WorkLogs) | Fetch Work Hours Data |
| Read | Process 8.0 → D1 (Users) | Fetch Employee Data |
| Read | Process 8.0 → D3 (Projects) | Fetch Project Data |
| Read | Process 8.0 → D11 (TaskFeedback) | Fetch Feedback Ratings |
| Read | Process 8.0 → D15 (SkillUsage) | Fetch Skill Analytics Data |
| Read | Process 8.0 → D12 (EmployeeReviews) | Fetch Review Scores |
| Read | Process 8.0 → D14 (TaskAuditLogs) | Fetch Audit Trail Data |
| Output | Process 8.0 → Admin | Global System Analytics, Audit Reports |
| Output | Process 8.0 → Manager | Team Performance Analytics, Workload Distribution, Project Analytics |
| Output | Process 8.0 → Team Lead | Task Completion Analytics, Skill Gap Analytics, Workload Heatmap |

---

### SECTION 7: STEP-BY-STEP DRAWING GUIDE

Now please guide me step-by-step to draw both diagrams. For each step, tell me:

1. **Which shape to draw** (Rectangle / Circle / Open-ended Rectangle / Arrow)
2. **What label to write** inside or on the shape
3. **Exact position** (top, bottom, left, right, center)
4. **Which arrows to draw** and in what direction (→ or ←), with the data flow label

**Please provide the guide in this format for EACH diagram:**

#### For Level 0 (Context Diagram):
- Step 1: Draw the central circle — label it "0.0 CogniStruct Task Management System"
- Step 2: Draw rectangle at top-left — label it "Admin"
- Step 3: Draw rectangle at top-right — label it "Manager"
- Step 4: Draw rectangle at bottom-left — label it "Team Lead"
- Step 5: Draw rectangle at bottom-right — label it "Employee"
- Step 6–onwards: Draw each arrow with its data flow label (use the tables from Section 5)

#### For Level 1:
- Step 1: Place all 4 External Entity rectangles on the outer edges
- Step 2: Place all 16 Data Store open-ended rectangles along the bottom and sides
- Step 3: Draw the 8 Process circles in the center area
- Step 4–onwards: Connect each process to data stores and external entities using arrows (use the tables from Section 6)

**Important constraints for drawing:**
- Use **Yourdon-DeMarco notation** (circles for processes, not rounded rectangles)
- Label EVERY arrow with a meaningful data flow name
- Number all processes (1.0, 2.0, ... 8.0)
- Number all data stores (D1, D2, ... D16)
- Keep the diagram neat and readable — avoid crossing arrows where possible
- Group related data stores near their primary process

---

### SECTION 8: ADDITIONAL NOTES

- This system does NOT have an HR role — only Admin, Manager, Team Lead, and Employee
- The system uses **JWT authentication** with **refresh tokens** (not session-based)
- Tasks support **hierarchy** (parent task → subtasks)
- Tasks have **SLA tracking** (SlaHours, SlaBreached)
- **Workload management** includes an escalation system via PauseRequests
- **Skill-based analytics** track which skills employees use on tasks (SkillUsage table)
- **Audit trails** are maintained via TaskAuditLogs for governance

---

## PROMPT END

---

> **Tip:** After pasting this into ChatGPT, you can follow up with:
> - "Now generate Draw.io XML for Level 0"
> - "Now generate Draw.io XML for Level 1"
> - "Can you generate a Mermaid diagram for this?"
> - "Guide me to draw this in Microsoft Visio"
