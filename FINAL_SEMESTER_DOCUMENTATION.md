# CogniStruct — Final Semester Project Documentation

> **Project Title:** CogniStruct — A Role-Based Task Management and Workforce Analytics Platform  
> **Technology Stack:** ASP.NET Core 9.0 (Backend) | React 19 + Vite 7 (Frontend) | SQL Server (Database)

---

## Chapter 1: Abstract

CogniStruct is a web-based task management system built to help organizations manage their daily work, track employee performance, and improve team collaboration. The system follows a role-based approach where five types of users — Admin, Manager, Team Lead, HR, and Employee — each get their own dashboard and set of features based on their responsibilities.

The main goal of this project is to provide a single platform where teams can create, assign, and track tasks, log working hours, monitor workload, and stay connected through daily updates and peer recognition. Instead of using multiple tools for different purposes, CogniStruct brings everything together in one place.

The backend of the application is built using ASP.NET Core 9.0 Web API with Entity Framework Core for database operations. It uses JWT (JSON Web Tokens) for secure login and role-based access control. The frontend is developed using React 19 with Vite as the build tool, providing a fast and responsive user interface. The database is managed through SQL Server with a Code-First approach, meaning the database structure is created directly from the code.

The system includes 10 database tables, 13 API controllers, and over 35 frontend pages. Key features include task management with priority and status tracking, time logging against tasks, workload analysis with a balanced scoring formula, employee engagement tools like daily updates, skill progress tracking, peer recognition, weekly reflections, and a gamified leaderboard.

Each role has carefully designed permissions. Admins have full control over users, roles, and teams. Managers oversee their team's tasks and performance. Team Leads focus on day-to-day task coordination. HR handles organization-wide people analytics. Employees manage their own tasks and use engagement features to stay productive and connected.

CogniStruct demonstrates the practical use of modern full-stack web development techniques, including RESTful API design, secure authentication, role-based routing, and component-based frontend architecture. It is designed to be scalable, maintainable, and easy to use for organizations of any size.

**Keywords:** Task Management, Role-Based Access Control, ASP.NET Core, React, JWT Authentication, Workforce Analytics, Employee Engagement, Full-Stack Web Application

---

## Chapter 2: Introduction

### 2.1 Introduction

The purpose of this academic project was to gain practical experience and technical expertise in full-stack web development, with a focus on building enterprise-level applications, while understanding the real-world challenges of software development in a professional environment. This report provides an insightful account of my learning journey at Kasadara Technology Solutions, where I undertook a 4-month project from December 2025 to April 2026. Throughout this period, I had the opportunity to work in a dynamic and collaborative environment, refining my skills in ASP.NET Core and React while gaining hands-on experience in web application development.

My project work began with an initial learning phase, where I familiarised myself with ASP.NET Core Web API, React 19, Entity Framework Core, and full-stack development principles. I explored various aspects of backend API design and frontend UI integration to ensure the seamless functionality of the application. The key project I worked on was "CogniStruct", a role-based task management and workforce analytics platform. This project required deep research into enterprise task management workflows, role-based access control strategies, employee engagement techniques, and secure data management. Collaborating with my team at Kasadara Technology Solutions, we successfully built a system that allows organizations to manage tasks, track time, monitor workload, and improve employee engagement — all from a single platform.

As part of my responsibilities, I contributed to researching enterprise workforce management trends to enhance the application's real-world utility, developing and optimising the backend API using ASP.NET Core 9.0 with JWT authentication and role-based authorization, building responsive frontend pages and reusable components using React 19, Vite 7, and Tailwind CSS, designing the database schema with 10 tables using the Code-First approach in Entity Framework Core with SQL Server, ensuring smooth frontend and backend integration for an enhanced user experience, and collaborating with team members to improve the reliability and performance of the software. Working on this project provided me with valuable insights into web application development, particularly in designing RESTful APIs, implementing secure authentication systems, managing relational databases, understanding user needs across different roles, and adapting to new technologies. Initially, learning new frameworks and handling the complexity of a multi-role system felt challenging, but team collaboration and consistent practice helped me overcome these obstacles and accelerate my learning process.

This academic project significantly contributed to my growth by strengthening my technical, leadership, and teamwork skills. I learned the importance of collaboration in a professional setting and how team efforts drive product success. Building CogniStruct taught me how to think about software from the perspective of different user roles — Admin, Manager, Team Lead, HR, and Employee — and design features that are relevant and useful for each. Additionally, I gained a deeper appreciation for research-driven development, as understanding real-time business requirements and organizational workflows played a crucial role in shaping the platform's functionality. The hands-on experience I gained in full-stack web development, database design, and security implementation has been instrumental in preparing me for future projects.

Moving forward, I see this experience as the foundation of my journey in full-stack development and enterprise software. The knowledge and skills acquired during this academic project will help me contribute effectively to future projects and upskill myself in other domains. My goal is to continue expanding my expertise in web application development, cloud deployment, and modern software architecture while exploring emerging technologies. This opportunity at Kasadara Technology Solutions has been a significant milestone in my professional journey, equipping me with the necessary technical and problem-solving skills to succeed in the ever-evolving world of technology.

### 2.2 Problem Statement

Most organizations today still rely on separate, disconnected tools or manual methods to manage tasks, track employee working hours, and monitor team performance. This leads to problems such as lack of visibility into who is working on what, difficulty in balancing workloads across team members, missed deadlines due to poor task tracking, and limited insight into overall team productivity. There is no single platform that brings together task management, time tracking, workload analysis, and employee engagement features while also providing role-specific access and dashboards for different levels of the organization.

### 2.3 Objectives

The main objectives of the CogniStruct project are:

1. **To develop a centralized task management system** that allows organizations to create, assign, track, and complete tasks across multiple teams and roles.

2. **To implement Role-Based Access Control (RBAC)** with five distinct roles — Admin, Manager, Team Lead, HR, and Employee — each with their own dashboard and permissions.

3. **To provide time tracking and workload monitoring** features that help managers and team leads understand how work is distributed and identify potential burnout situations.

4. **To build employee engagement tools** including daily updates, peer recognition, skill progress tracking, weekly reflections, and a gamified leaderboard to keep employees motivated and connected.

5. **To design and implement a secure authentication system** using JWT tokens and BCrypt password hashing to protect user data and ensure only authorized access.

6. **To create a responsive and user-friendly web interface** using React 19 with Tailwind CSS that works smoothly across different devices and screen sizes.

7. **To demonstrate full-stack web development skills** by building a complete application with a RESTful API backend (ASP.NET Core), a modern frontend (React + Vite), and a relational database (SQL Server).

### 2.4 Scope of the Project

The scope of CogniStruct covers the following areas:

- **User Management:** Admin can create, update, activate, and deactivate user accounts and assign roles and managers.
- **Task Management:** Tasks can be created, assigned to employees, tracked through stages (Pending, Assigned, In Progress, Completed), and monitored with priorities (Low, Medium, High, Critical).
- **Team Management:** Admin can organize users into teams, assign team managers, and manage team membership.
- **Time Logging:** Employees can log their working hours against specific tasks, and managers can review team-level time logs.
- **Workload Analysis:** The system calculates a workload percentage for each employee based on active tasks and weekly hours, helping managers distribute work fairly.
- **Employee Engagement:** Daily updates, peer recognition, skill tracking, weekly reflections, and leaderboard features encourage employee participation and growth.
- **Role-Based Dashboards:** Each role gets a personalized dashboard showing relevant data and navigation links.
- **Authentication & Security:** Secure login with JWT tokens, role-based API access, password hashing, and token refresh.
- **Notifications & Settings:** Users receive in-app notifications and can customize their application settings such as theme, timezone, and notification preferences.

### 2.5 Methodology

The project was developed using the **Agile methodology** with an iterative approach. The development was divided into sprints, with each sprint focusing on a specific module or feature set. The key steps followed during development were:

1. **Requirement Analysis** — Understanding the features needed for each role and defining the scope.
2. **Database Design** — Designing the database schema with 10 tables using the Code-First approach in Entity Framework Core.
3. **Backend Development** — Building 13 REST API controllers in ASP.NET Core 9.0 with JWT authentication and role-based authorization.
4. **Frontend Development** — Creating 35+ React pages and reusable components using React 19, Vite 7, and Tailwind CSS.
5. **Integration & Testing** — Connecting frontend with backend APIs, testing each module, and fixing bugs.
6. **Deployment & Documentation** — Preparing the final build and writing project documentation.

### 2.6 Organization of the Report

This documentation is organized into the following chapters:

| Chapter | Title | Description |
|---|---|---|
| Chapter 1 | Abstract | A brief summary of the project, its goals, and technology used |
| Chapter 2 | Introduction | Background, problem statement, objectives, scope, and methodology |
| Chapter 3 | Literature Survey / Background Study | Overview of existing systems and technologies used |
| Chapter 4 | System Requirements | Hardware, software, and functional requirements |
| Chapter 5 | System Design | Architecture, database design, ER diagrams, and data flow |
| Chapter 6 | Implementation | Backend and frontend development details with code samples |
| Chapter 7 | Testing | Testing strategies and results |
| Chapter 8 | Screenshots | Application screenshots for each module |
| Chapter 9 | Conclusion & Future Scope | Summary of achievements and planned enhancements |
| Chapter 10 | References | Books, websites, and resources used |

---

## Chapter 3: Project Details & System Analysis

In the rapidly evolving corporate landscape, fragmented task tracking and disjointed team communication often result in missed deadlines, unbalanced workloads, and suboptimal workforce productivity. CogniStruct — A Role-Based Task Management and Workforce Analytics Platform — is a comprehensive digital solution designed to bridge the gap between organizational leadership, team management, and individual employees through a unified, real-time architecture. This project orchestrates the complex interactions of five distinct role-based modules: Admin, Manager, Team Lead, HR, and Employee, creating a synchronized operational workflow focused on accountability, transparency, and productivity.

At its core, the system provides Administrators with a centralized dashboard for organization-wide oversight of users, roles, teams, and system health monitoring. Managers utilize dedicated tools to oversee their team's tasks, approve requests, and analyze team performance through data-driven analytics. Team Leads coordinate day-to-day task assignments and monitor team members' daily updates and workload distribution. HR personnel access organization-wide people analytics, employee directories, and time log oversight capabilities. Meanwhile, the Employee module offers individuals a personalized interface to manage their own tasks, log working hours, send daily updates, track skill progress, participate in peer recognition, write weekly reflections, and compete on a gamified leaderboard.

To address the critical challenge of workforce visibility and engagement, the ecosystem includes dedicated engagement features such as daily status updates with acknowledgment workflows, peer recognition systems for appreciating colleagues, skill tracking with visual progress indicators, and weekly self-reflection journals. Powered by ASP.NET Core 9.0 Web API for the backend and React 19 for the frontend, with SQL Server as the relational database, the system eliminates communication silos between organizational hierarchies, reduces manual errors in task tracking and time logging, and guarantees a transparent, responsive, and efficient workforce management network.

---

### 3.1 Problem Identification

The traditional and manual approach to task management and workforce monitoring currently faces several critical challenges that hinder operational efficiency, compromise team productivity, and negatively impact overall organizational performance. In modern enterprise environments, the reliance on outdated legacy systems, disconnected spreadsheets, or completely manual processes creates significant bottlenecks. This section identifies and elaborates on the core problems that necessitate the development of a comprehensive, multi-role Task Management and Workforce Analytics Platform encompassing dedicated dashboards for Admins, Managers, Team Leads, HR, and Employees.

#### 3.1.1 Fragmented Task Management and Communication Gaps

One of the most profound issues in conventional organizational setups is the fragmentation of daily task management operations. Typically, managers assign tasks through emails or verbal instructions, employees track their progress on personal notes or spreadsheets, and team leads have limited visibility into the actual status of ongoing work. This disconnect leads to communication gaps, increased follow-up overhead, and a higher probability of tasks being duplicated, forgotten, or completed past their deadlines. In scenarios involving cross-functional projects, the lack of an integrated communication channel means that updates regarding task assignment, progress, priority changes, and completion are manually relayed through multiple platforms, often resulting in delayed or conflicting information. The absence of a centralized digital ecosystem prevents real-time synchronization between different levels of the organizational hierarchy — from top-level administrators to individual employees.

#### 3.1.2 Inefficient Time Tracking and Workload Distribution

Time tracking and workload management in many organizations is a highly neglected area that directly impacts both employee well-being and project delivery timelines. Traditional systems often rely on self-reported timesheets submitted at the end of the week or month, which are inherently inaccurate and prone to estimation errors. This approach makes it nearly impossible for managers to understand how much time is actually being spent on specific tasks or projects. Furthermore, without a real-time workload monitoring system, some team members end up overloaded with work while others remain underutilized. This imbalance leads to employee burnout on one hand and wasted human resources on the other. The inability to dynamically track active task counts and weekly working hours against established capacity thresholds poses a severe operational risk, often resulting in missed deadlines, quality degradation, and increased employee turnover.

#### 3.1.3 Lack of Employee Engagement and Recognition

In today's competitive job market, employee engagement and motivation are critical factors that directly influence retention rates, productivity, and overall job satisfaction. Traditional workplaces typically lack structured mechanisms for employees to share their daily accomplishments, reflect on their weekly progress, or receive recognition from peers for exceptional work. When appreciation is limited to annual performance reviews, employees feel disconnected from their contributions and undervalued in their daily efforts. The absence of dedicated tools for daily status updates, peer-to-peer recognition, skill development tracking, and self-reflection means that organizations miss out on valuable insights into employee morale, growth trajectory, and team dynamics. Without a gamified system that encourages healthy competition and continuous improvement, maintaining high levels of workforce engagement becomes an ongoing struggle for management.

#### 3.1.4 Limited Visibility and Analytics for Decision-Making

As organizations grow in size and complexity, managers and HR personnel frequently encounter decision-making challenges without proper data visibility and analytical tools. Without a dedicated analytics system, questions like "Which team has the highest task completion rate?", "What is the average time to complete tasks of different priorities?", "Which employees are consistently overloaded?", or "How has team productivity changed over the past quarter?" remain unanswered. Traditional approaches rely on manual compilation of data from various disconnected sources — attendance registers, email threads, spreadsheet trackers — which is time-consuming, error-prone, and always outdated by the time it reaches decision-makers. This opacity in operational data prevents strategic planning, makes it impossible to identify bottlenecks early, and hinders the organization's ability to scale efficiently.

#### 3.1.5 Data Security, Role-Based Access, and Compliance Concerns

Organizational data, including employee personal information, task histories, performance metrics, and daily communication logs, is highly sensitive and must be protected against unauthorized access. Many existing task management solutions either provide uniform access to all users regardless of their role, or rely on basic permission settings that are insufficient for complex organizational hierarchies. A warehouse clerk should not have access to HR analytics, and an employee should not be able to modify another team member's task assignments. Paper-based records and legacy desktop applications are highly vulnerable to unauthorized access, accidental data exposure, and catastrophic data loss due to hardware failure. Additionally, the absence of secure authentication mechanisms such as token-based authorization and encrypted password storage exposes the organization to significant security risks, including data breaches and compliance violations.

---

### 3.2 Feasibility Study

Before initiating the extensive development of the integrated CogniStruct platform, a comprehensive feasibility study was conducted. This study ensures that the project is not only viable from a technological standpoint but also makes sound financial and operational sense. The analysis is broken down into technical, economic, and operational feasibility.

#### 3.2.1 Technical Feasibility

The technical feasibility of this project evaluates whether the required technology exists, whether it can handle the proposed scale, and whether the development team possesses the necessary expertise. The evaluation overwhelmingly supports the project's viability.

The system architecture relies on modern, robust, and industry-proven technologies. For the backend, **ASP.NET Core 9.0 Web API** is selected as the server-side framework. ASP.NET Core is a high-performance, cross-platform framework developed by Microsoft that is widely used in enterprise-grade applications. It provides the essential features required for a complex task management system:

- **Entity Framework Core 9.0 (ORM):** Enables a Code-First approach to database design, allowing the database schema to be defined directly through C# model classes and managed through automated migrations. This significantly reduces manual SQL scripting and ensures database consistency.
- **JWT (JSON Web Tokens) Authentication:** Handles secure user logins and role-based access control. Every API request is verified through Bearer tokens, ensuring that only authorized users can access protected resources.
- **BCrypt Password Hashing:** All user passwords are securely hashed using the BCrypt algorithm before storage, making them resistant to brute-force attacks and ensuring compliance with modern security standards.
- **Role-Based Authorization:** The `[Authorize(Roles = "...")]` attribute on API controllers ensures strict access control, allowing endpoints to be restricted to specific roles such as Admin, Manager, TeamLead, HR, or Employee.

For the frontend, **React 19** is selected as the UI framework, combined with **Vite 7** as the build tool for fast development and hot module replacement. React's component-based architecture allows for the creation of reusable, modular UI elements across 35+ pages. **Tailwind CSS** provides utility-first styling for responsive, modern interfaces. **React Router v7** handles client-side routing with role-based URL prefixes (`/admin/`, `/manager/`, `/teamlead/`, `/hr/`, `/employee/`), ensuring each role has its own isolated navigation experience.

The database layer uses **SQL Server** as the relational database management system, providing enterprise-grade reliability, ACID compliance, and robust query performance. The system currently manages 10 database tables with well-defined relationships and foreign key constraints across users, roles, teams, tasks, work logs, daily updates, notifications, and user settings.

The integration of additional libraries such as **Axios** for HTTP communication, **Lucide React** for iconography, and **React Hot Toast** for user notifications further solidifies the technical soundness of the proposed architecture.

#### 3.2.2 Economic Feasibility

Economic feasibility, or cost-benefit analysis, determines whether the financial investment in developing and maintaining the software is justified by the expected returns. The project demonstrates high economic feasibility.

**Cost Reduction:** By utilizing open-source technologies across the entire stack — ASP.NET Core (free and open-source), React (MIT license), SQL Server Express/Developer Edition (free for development), and Vite (MIT license) — the cost of proprietary software licensing is completely eliminated. The use of a single React codebase for the entire frontend, rather than building separate applications for each role, drastically reduces development effort and maintenance overhead. Furthermore, Entity Framework Core's Code-First approach eliminates the need for dedicated database administrators for routine schema changes.

**Productivity Gains and ROI:** The introduction of CogniStruct directly addresses productivity losses caused by fragmented task management. By providing real-time workload analysis, managers can distribute work more evenly, reducing burnout-related absenteeism. The time tracking module eliminates inaccurate manual timesheets, providing precise data for resource planning and project costing. The employee engagement features — daily updates, peer recognition, skill tracking, and leaderboard — are proven strategies for improving employee retention, which directly reduces the significant costs associated with recruiting and training replacement staff. The combination of increased productivity, reduced operational waste, and improved employee retention guarantees a substantial Return on Investment (ROI) over a relatively short period.

#### 3.2.3 Operational Feasibility

Operational feasibility assesses how well the proposed system will integrate into the daily work environment and whether the staff at all levels will adopt it. The strategic decision to implement role-based dashboards with tailored features guarantees high operational feasibility.

Instead of forcing a single, overly complex software interface on every employee, CogniStruct provides contextualized tools based on user roles. An Employee only sees their own tasks, time logs, daily update form, skill tracker, and engagement features. A Team Lead sees their team's tasks, daily updates, and workload distribution. A Manager gets team performance analytics, approval workflows, and team pulse features. HR accesses organization-wide people analytics. Admins get complete system control with user management, role assignment, and audit logging. This modular, role-based approach drastically reduces the learning curve and technical training required for staff at each level.

For the administrative staff, the centralized Admin Dashboard provides a clear, bird's-eye view of the entire organization's operations without requiring them to interact with individual team workflows. Furthermore, the system's intuitive UI — designed with React 19 and Tailwind CSS — follows modern UX principles with clean layouts, smooth animations, and responsive design, ensuring high acceptance rates from users across all roles and technical literacy levels. The Sidebar navigation with role-specific menu items ensures that users can find features quickly without confusion, minimizing the transition effort from legacy tools.

---

### 3.3 System Requirement Analysis

A thorough System Requirement Analysis was conducted to precisely define what CogniStruct must do (Functional Requirements) and how well it must perform these tasks under various conditions (Non-Functional Requirements). This comprehensive blueprint ensures all stakeholders have a unified understanding of the project's scope.

#### 3.3.1 Functional Requirements

Functional requirements define the core behaviours and technical capabilities of the various modules within the CogniStruct ecosystem.

**User Authentication & Role Management:** The system must allow users to log in securely using email and password. Upon successful authentication, the system must issue JWT access tokens and refresh tokens. Access to all features must be strictly governed by the user's assigned role(s) — Admin, Manager, Team Lead, HR, or Employee. Admins must be able to create, edit, activate, deactivate user accounts, assign roles, and set reporting managers.

**Task Management:** The system must support the complete lifecycle of task management. Admins, Managers, and Team Leads must be able to create tasks with titles, descriptions, priorities (Low, Medium, High, Critical), deadlines, and estimated hours. Tasks must be assignable to specific employees. The task status must progress through defined stages — Pending, Assigned, In Progress, and Completed. All users must be able to view tasks relevant to their role, and the system must track creation, update, and completion timestamps.

**Time Logging & Work Logs:** Employees must be able to log their working hours against specific tasks, specifying start time, end time, total hours worked, and a description of work performed. Managers and Team Leads must be able to review time logs submitted by their team members. The system must support creating, updating, and deleting work log entries.

**Team Management:** Admins must be able to create teams, assign team managers, add or remove team members, and manage team details. All roles must be able to view team information relevant to their scope — Admins see all teams, Managers see their own teams, and Team Leads see their assigned team.

**Workload Analysis:** The system must calculate a workload percentage for each employee based on two equally weighted factors — the number of active tasks (out of a maximum capacity of 10) and weekly logged hours (out of a maximum capacity of 40 hours). The workload must be categorized into threshold labels: Low (0–29%), Moderate (30–59%), Nearing Capacity (60–79%), and Overloaded (80–100%). Managers and Team Leads must be able to view workload distribution across their team to make informed task assignment decisions.

**Employee Engagement Features:** The system must provide the following engagement tools exclusively for Employees:
- **Daily Updates:** Employees must be able to write and submit daily status updates to a manually entered recipient. Managers and Team Leads must be able to view and acknowledge these updates.
- **Peer Recognition:** Employees must be able to recognize and appreciate colleagues publicly through a dedicated recognition interface.
- **Skill Progress:** Employees must be able to track their personal skill development over time with visual progress indicators.
- **Weekly Reflection:** Employees must be able to write weekly self-assessment journal entries to track personal growth and challenges.
- **Leaderboard:** A gamified productivity leaderboard must rank employees based on task completion and activity metrics to encourage healthy competition.

**Role-Based Dashboards:** Each role must have its own dedicated dashboard page displaying relevant metrics and quick-access navigation. The Admin Dashboard must show organization-wide user, task, and team statistics. The Manager Dashboard must display team-focused performance data. The Employee Dashboard must show personal task summaries and engagement activity.

**Profile Management:** All users must be able to view and edit their own profile information including personal details, contact information, bio, job title, skills, and avatar image. A read-only Public Profile view must be accessible for viewing other users' profiles. Employees must have a Skills Card feature displaying their skills as tag chips.

**Notifications & Settings:** Users must receive in-app notifications for task assignments, status changes, and other relevant events. Users must be able to mark notifications as read. A Settings page must allow users to customize their preferences including theme (light/dark), timezone, notification toggles, compact mode, and privacy settings such as online status visibility.

**Analytics & Reporting:** Admins, Managers, and HR must have access to analytics dashboards showing task completion rates, average completion times, productivity scores, team comparison charts, and weekly productivity trends. These analytics must be derived from real-time task and work log data.

#### 3.3.2 Non-Functional Requirements

Non-functional requirements specify the criteria used to judge the operation of the system, ensuring reliability, security, and a high-quality user experience.

**Security & Privacy:** The system must adhere to strict data security protocols. All communication between the React frontend and the ASP.NET Core backend must be transmitted via HTTP with proper CORS configuration. API access must be governed by JWT Bearer token validation on every protected endpoint. Role-based authorization using `[Authorize(Roles = "...")]` attributes must ensure that, for instance, an Employee cannot access Admin-level user management endpoints or HR analytics data. All user passwords must be hashed using the BCrypt algorithm before storage in the database. Refresh tokens must be securely stored in the database with expiration timestamps to prevent unauthorized session persistence.

**Performance & Responsiveness:** The React frontend must render smoothly and provide a fast, interactive user experience across all 35+ pages. API endpoints and Entity Framework Core database queries must be optimized with proper indexing, eager loading where necessary, and efficient LINQ queries so that data retrieval — such as task lists, dashboard statistics, or analytics charts — occurs within acceptable response times. The Vite build tool must ensure fast Hot Module Replacement (HMR) during development and optimized production bundles for deployment.

**Scalability:** The system architecture must be designed for future scalability. The separation of concerns between the frontend (React SPA) and backend (ASP.NET Core Web API) through a clean RESTful API layer allows each tier to be scaled independently. The SQL Server database must be designed with proper normalization, indexing, and foreign key constraints to handle growing volumes of users, tasks, work logs, and notifications without significant performance degradation. The modular controller-based backend structure (13 controllers) ensures that new features or modules can be added without disrupting existing functionality.

**Reliability & Data Integrity:** The system must maintain data integrity through Entity Framework Core's built-in transaction management and SQL Server's ACID compliance. Foreign key constraints across all 10 tables must prevent orphaned records. Soft-delete functionality (using the `IsActive` flag on Users) must be used instead of hard deletion to preserve data history and audit trails. The Code-First migration system must ensure that database schema changes are versioned, reversible, and consistently applied across all environments.

**Usability & Accessibility:** All pages must adhere to modern UI/UX principles, utilizing clean typography, consistent colour schemes through Tailwind CSS utility classes, intuitive sidebar navigation with role-specific menu items, and responsive layouts that adapt to different screen sizes. The interface must use clear visual indicators for task priorities (colour-coded), workload levels (gauge visualizations), and notification states (read/unread badges). Toast notifications via React Hot Toast must provide immediate, non-intrusive feedback for user actions. The login page must be simple and professional, requiring minimal input to authenticate.

---

## Chapter 4: System Design

This chapter outlines the structured approach used to build the scalable and secure CogniStruct ecosystem comprising five role-based modules — Admin, Manager, Team Lead, HR, and Employee — each with their own dedicated dashboards, features, and permission boundaries.

### 4.1 System Architecture Design

The system relies on a modern **Client-Server Architecture**, specifically utilizing a cleanly decoupled, two-tier approach where the frontend and backend communicate exclusively through RESTful API endpoints over HTTP.

#### 4.1.1 The Client Tier (Frontend)

The "client" refers to the web application that interacts with end-users across all five roles. We utilize **React 19**, a component-based JavaScript UI library, combined with **Vite 7** as the build and development tool. By using React with a Single Page Application (SPA) approach, we build distinct role-based experiences from a single, shared codebase, ensuring:

**Consistency:** The design language, component library, and styling system remain identical regardless of which role the user is logged in as. Whether an Admin is managing users on a desktop monitor or an Employee is checking their tasks on a laptop, the interface follows the same Tailwind CSS design system with consistent colours, spacing, typography, and interactive behaviours.

**Performance:** Vite's blazing-fast Hot Module Replacement (HMR) during development and optimized production bundling ensure rapid page loads and smooth interactions. React's virtual DOM efficiently updates only the changed portions of the interface, providing snappy response times essential for data-heavy dashboards, analytics charts, and real-time notification updates.

**Modular Navigation:** React Router v7 handles client-side routing with role-based URL prefixes (`/admin/`, `/manager/`, `/teamlead/`, `/hr/`, `/employee/`). Each role has its own dedicated route namespace, ensuring clean separation of concerns in the navigation structure. The `ProtectedRoute` and `RoleBasedRedirect` components enforce that users can only access pages authorized for their role.

#### 4.1.2 The Server Tier (Backend)

The backend infrastructure is powered by **ASP.NET Core 9.0 Web API**, a high-performance, cross-platform server-side framework developed by Microsoft. This architecture provides a robust, self-contained API server that handles all business logic, data processing, and security enforcement.

**Database Management:** Entity Framework Core 9.0 serves as the Object-Relational Mapper (ORM), acting as the bridge between C# application code and the SQL Server database. Using the Code-First approach, database tables are defined as C# model classes, and schema changes are managed through versioned migrations — eliminating the need for manual SQL scripting.

**Authentication Service:** The backend manages user logins through a dedicated `AuthController`. Upon successful credential verification (email + BCrypt password hash comparison), the server issues a JWT access token containing the user's ID, email, and role claims. A long-lived refresh token is also generated and stored in the database, enabling seamless session renewal without requiring repeated logins.

**Role-Based Authorization:** Every API controller is protected with `[Authorize(Roles = "...")]` attributes. When an HTTP request arrives, the ASP.NET Core middleware first validates the JWT token from the `Authorization: Bearer <token>` header, then checks whether the user's role claim matches the endpoint's required roles. This ensures that, for example, only Admins can access user management endpoints, and only Managers can access team analytics.

**13 Dedicated API Controllers:** The backend is organized into 13 specialized controllers — `AuthController`, `UsersController`, `ProfileController`, `TasksController`, `TeamsController`, `WorkLogsController`, `WorkloadController`, `AnalyticsController`, `DailyUpdatesController`, `SettingsController`, `ManagersController`, `NotificationsController`, and `RolesController` — each handling a specific domain of business logic with clean separation of responsibilities.

#### 4.1.3 The Request Flow (Data Communication)

A critical component of the architecture is the structured request-response flow between the React frontend and ASP.NET Core backend. The communication follows a predictable, secure pattern:

1. **User Action:** The user interacts with the React UI (e.g., clicks "Create Task", submits a time log, or opens a dashboard).
2. **Axios HTTP Request:** The frontend's API module (one of 12 dedicated API files like `taskApi.js`, `workLogApi.js`, etc.) uses the centralized `axiosInstance.js` to send an HTTP request. The Axios interceptor automatically attaches the JWT token to the `Authorization` header of every outgoing request.
3. **JWT Validation:** The ASP.NET Core middleware intercepts the request and validates the JWT token's signature, expiration, and claims.
4. **Role Authorization:** The `[Authorize]` attribute on the target controller checks whether the user's role claim matches the endpoint's requirements.
5. **Business Logic & Database Query:** The controller processes the request using Entity Framework Core to read from or write to the SQL Server database.
6. **JSON Response:** The server returns the result as a structured JSON response, which the React frontend parses and renders on the UI.
7. **Error Handling:** On a 401 (Unauthorized) response, the Axios interceptor automatically redirects the user to the login page. Toast notifications via React Hot Toast provide immediate user feedback for both success and error states.

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  (Vite 7 + React Router v7 + Axios + Tailwind)  │
│         35+ Pages | 12 API Modules               │
│                  Port: 5173                      │
└─────────────┬───────────────────────────────────┘
              │  HTTP/REST (JSON)
              │  Authorization: Bearer <JWT>
┌─────────────▼───────────────────────────────────┐
│              ASP.NET Core 9.0 Web API            │
│     13 Controllers + DTOs + JWT Middleware       │
│      [Authorize(Roles = "Admin,Manager,...")]    │
│                  Port: 5000                      │
├─────────────────────────────────────────────────┤
│         Entity Framework Core 9.0 (ORM)          │
│          Code-First | LINQ Queries               │
└─────────────┬───────────────────────────────────┘
              │  SQL Queries (Parameterized)
┌─────────────▼───────────────────────────────────┐
│              SQL Server Database                 │
│       10 Tables | Foreign Keys | Indexes         │
│     Code-First Migrations | ACID Compliant       │
└─────────────────────────────────────────────────┘
```

---

### 4.2 Database Design

A well-structured database is the backbone of the CogniStruct platform. The system utilizes **SQL Server** as its relational database management system, providing enterprise-grade reliability, ACID compliance, and robust query performance. The data is organized into 10 interconnected tables designed to reduce redundancy and ensure data integrity through proper normalization and foreign key constraints.

#### 4.2.1 Database Tables Overview

The 10 tables are logically grouped into four domains:

**User & Access Management:**
- **Users** — Stores all user accounts with personal details, profile information, employment data, skills, manager assignments, and authentication tokens. Contains 25+ columns covering everything from basic info (name, email, password hash) to extended profile fields (bio, interests, job title, worker type).
- **Roles** — Defines the five system roles: Admin, Manager, TeamLead, HR, and Employee.
- **UserRoles** — A many-to-many join table linking users to their assigned roles, allowing a single user to hold multiple roles.
- **UserSettings** — Stores per-user application preferences including theme (light/dark), timezone, notification toggles, compact mode, and privacy settings.

**Team & Project Management:**
- **Teams** — Defines organizational teams with a manager assignment and active status flag.
- **TeamMembers** — A many-to-many join table linking users to teams with a join date.

**Task & Time Tracking:**
- **Tasks** — The core task table with title, description, assignee, assigner, team association, priority (0–3), status (0–3), deadline, estimated hours, and timestamps for creation, update, and completion.
- **WorkLogs** — Time log entries linked to specific tasks and users, recording start time, end time, total hours, and work description.

**Engagement & Communication:**
- **DailyUpdateStatuses** — Stores employee daily status updates with submission date, summary text, recipient acknowledgment tracking, and timestamps.
- **Notifications** — In-app notification messages for each user with type, content, read/unread status, and creation timestamp.

#### 4.2.2 Code-First Approach & Migrations

The database schema is defined entirely through C# model classes in the `Models/` directory. Entity Framework Core's Code-First approach means:

- **No manual SQL:** Tables, columns, data types, and constraints are all defined as C# properties and data annotations. For example, `[Required]`, `[MaxLength(200)]`, and `[ForeignKey("UserId")]` attributes on model properties automatically translate into SQL Server constraints.
- **Versioned Migrations:** Every schema change generates a timestamped migration file in the `Migrations/` directory. Running `dotnet ef database update` applies pending migrations in order, ensuring the database structure stays synchronized with the code across all development and deployment environments.
- **Relationships & Navigation Properties:** Entity Framework Core manages foreign key relationships through navigation properties. For instance, the `User` model has a `ManagerId` property pointing to another `User`, and the `TaskItem` model has both `AssigneeId` and `AssignerId` foreign keys linking back to the `Users` table.

#### 4.2.3 Role-Based Data Access

Unlike simple permission checks at the API level, CogniStruct implements data filtering at the query level to ensure users only receive data within their authorized scope:

- **Admin** queries return organization-wide data across all users, teams, and tasks.
- **Manager** queries are filtered to return only data for teams and employees under their direct management.
- **Team Lead** queries are scoped to their assigned team members and related tasks.
- **HR** queries access organization-wide people data for analytics but cannot modify operational task data.
- **Employee** queries return only their own personal tasks, time logs, daily updates, and profile information.

This query-level filtering is enforced within each API controller's business logic, ensuring that even if a user manipulates frontend code, the server will never return unauthorized data.

---

### 4.3 Interface and UI/UX Design

The User Interface (UI) and User Experience (UX) were designed with the philosophy that technology should simplify daily work, not complicate it. Each role's interface is tailored to show only what is relevant, reducing cognitive overload and improving task completion speed.

#### 4.3.1 Employee Application

The Employee interface focuses on personal productivity and engagement. The design uses a clean, professional colour palette with Tailwind CSS utilities to create a calming, focused workspace. The sidebar navigation provides quick access to the six core employee features — My Tasks, Time Logs, Daily Updates, Skill Progress, Peer Recognition, Weekly Reflection, and Leaderboard. Task cards use colour-coded priority indicators (green for Low, yellow for Medium, orange for High, red for Critical) for instant visual scanning. The Daily Update form is streamlined into a simple text input with a recipient field, requiring minimal effort to submit end-of-day summaries. The Skills Card on the profile page displays personal skills as interactive tag chips, and the Leaderboard uses a gamified ranking layout to encourage healthy competition among team members.

#### 4.3.2 Manager & Team Lead Applications

The Manager and Team Lead interfaces prioritize team oversight and decision-making efficiency over individual task management. The Manager Dashboard provides a bird's-eye view of team performance metrics, pending approvals, and team pulse data. Large, prominent metric cards display key statistics like total tasks, completion rates, and team workload distribution at a glance. The Task Management page uses a data table with sorting, filtering, and pagination for handling large volumes of team tasks efficiently. The Team Pulse feature provides a quick sentiment check-in interface. The Workload page includes gauge visualizations that immediately communicate whether team members are under-utilized, balanced, or overloaded — using the 50/50 weighted formula (active tasks + weekly hours). High-contrast workload threshold labels (Low, Moderate, Nearing Capacity, Overloaded) ensure managers can identify burnout risks without reading detailed numbers.

#### 4.3.3 Admin & HR Applications

The Admin interface prioritizes comprehensive system control with maximum data density. The Admin Dashboard displays organization-wide statistics for users, tasks, and teams in a structured grid layout. The User Management page provides a full CRUD interface with inline actions for creating, editing, activating/deactivating accounts, assigning roles, and setting reporting managers. The Role Management page shows a clean overview of all roles with user counts. System Health monitoring, Audit Log tracking, and Employee Insights provide deep administrative visibility. The HR interface shares a similar data-dense approach but focuses on people analytics — headcount trends, employee directories, organization-wide time log oversight, and HR-specific analytics dashboards. Both interfaces use consistent DataTable components with search, sort, and pagination for handling large datasets efficiently.

#### 4.3.4 Login & Authentication Interface

The Login page is designed to be simple, professional, and trust-inspiring. It features a clean, centered form with email and password fields, a prominent submit button, and clear error messaging via toast notifications. The interface avoids unnecessary visual clutter, focusing the user's attention entirely on the credential input. Upon successful authentication, the `RoleBasedRedirect` component automatically navigates the user to their role-specific dashboard, creating a seamless onboarding experience.

---

### 4.4 Core Module Design

The CogniStruct system is logically divided into self-contained, purpose-built modules that work together seamlessly through the shared database and API layer.

**Authentication & Security Module:** Handles the complete authentication lifecycle — user login via email and password, JWT access token issuance with role claims, refresh token generation and storage, BCrypt password hashing, and session management. The Axios interceptor on the frontend automatically attaches tokens to every request and handles 401 redirects. The `ProtectedRoute` component on the frontend enforces that unauthenticated users cannot access any application pages, while `[Authorize]` attributes on the backend ensure API-level security.

**User & Role Management Module:** Provides Admins with complete control over the organization's user base. This module handles user account CRUD operations (create, read, update, deactivate), role assignment (mapping users to Admin, Manager, TeamLead, HR, or Employee roles), manager assignment (setting reporting hierarchies), and user search with filters and pagination. It serves as the foundation for the entire role-based access control system, determining what features and data each user can access throughout the platform.

**Task Management Module:** The central hub for work tracking and assignment. This module manages the complete task lifecycle from creation to completion. Admins, Managers, and Team Leads can create tasks with detailed metadata (title, description, priority, deadline, estimated hours) and assign them to specific employees. The task status progresses through four defined stages — Pending, Assigned, In Progress, and Completed — with timestamps recorded at each transition. Each role sees tasks filtered to their scope: Admins see all tasks, Managers see their team's tasks, and Employees see only their own assigned tasks.

**Time Tracking & Work Logs Module:** Dedicated to recording and monitoring working hours across the organization. Employees log time entries against specific tasks, specifying start and end times, total hours, and a description of work performed. This data feeds directly into the Workload Analysis module and provides Managers and Team Leads with visibility into how time is being allocated across their team. The module supports creating, editing, and deleting work log entries with full audit timestamps.

**Workload Analysis Module:** This module provides real-time workload visibility using a balanced scoring formula: `Workload % = min(100, round((activeTasks / 10 × 50) + (weeklyHours / 40 × 50)))`. By equally weighting active task count and weekly logged hours, the system generates a single percentage score for each employee. The scores are categorized into four threshold levels — Low (0–29%), Moderate (30–59%), Nearing Capacity (60–79%), and Overloaded (80–100%) — displayed via gauge visualizations and colour-coded labels. Managers and Team Leads use this data to make informed task assignment decisions and proactively prevent employee burnout.

**Employee Engagement Module:** This module houses the five engagement features designed to keep employees motivated, connected, and growing. The Daily Updates feature allows employees to submit daily status summaries to a manually entered recipient, with Managers and Team Leads able to view and acknowledge them. Peer Recognition enables employees to publicly appreciate colleagues for great work. Skill Progress tracking provides visual indicators for personal development over time. Weekly Reflection journals offer a structured space for self-assessment and growth tracking. The Leaderboard provides gamified productivity rankings based on task completion and activity, encouraging healthy competition across the team.

**Analytics & Reporting Module:** This module provides data-driven insights by aggregating data from the Task and Work Log modules. Admins, Managers, and HR can access dashboards showing task completion rates, average completion times, individual and team productivity scores, team comparison charts, and weekly productivity trends. These analytics transform raw operational data into actionable intelligence, enabling strategic decisions about resource allocation, performance management, and organizational planning.

**Notifications & Settings Module:** This module handles the communication and personalization layer of the platform. In-app notifications inform users about task assignments, status changes, and other relevant events, with read/unread tracking and a notification bell indicator. The Settings page allows each user to customize their experience — choosing between light and dark themes, setting their timezone, toggling notification preferences (email, push, task updates, team messages), enabling compact mode, and controlling privacy settings like online status and last seen visibility.

---

## Chapter 5: System Implementation

### 5.1 Introduction to Implementation

The implementation phase represents the culmination of the system design and requirement analysis into a fully functional and deployable software platform. The development of the CogniStruct — Role-Based Task Management and Workforce Analytics Platform — was executed using a modular, agile approach, translating theoretical architectural blueprints into a robust, living application. This chapter details the technical processes involved in constructing both the frontend user interfaces and the backend API infrastructure, ensuring all five distinct role-based modules (Admin, Manager, Team Lead, HR, and Employee) operate seamlessly through a unified RESTful API layer. The core technologies utilized for this implementation were **React 19** with **Vite 7** for the frontend Single Page Application, **ASP.NET Core 9.0 Web API** for the backend server, and **SQL Server** as the relational database, all communicating through structured JSON over HTTP.

---

### 5.2 Frontend Implementation (React 19 + Vite 7)

The selection of React 19 as the primary frontend framework was pivotal in maintaining a single, shared codebase while delivering five distinct, role-specific user experiences. The frontend implementation focused on creating intuitive, high-performance interfaces capable of handling data-heavy dashboards, real-time notifications, and complex form interactions across all organizational roles.

#### 5.2.1 Project Structure and Build Configuration

The frontend project was initialized using Vite 7, a next-generation build tool that provides blazing-fast Hot Module Replacement (HMR) during development and highly optimized production bundles for deployment. The `vite.config.js` file was configured with the `@vitejs/plugin-react` for JSX transformation and `@tailwindcss/vite` for Tailwind CSS v4 integration. A critical configuration decision was the use of Vite's built-in proxy feature — all API requests to `/api` and file upload requests to `/uploads` are automatically proxied from the frontend development server (port 5173) to the backend server (port 5000), eliminating CORS issues during local development and creating a seamless development experience.

The `src/` directory follows a well-organized, modular architecture with clear separation of concerns:
- **`api/`** — 17 dedicated API modules (`taskApi.js`, `workLogApi.js`, `analyticsApi.js`, `projectApi.js`, `pauseRequestApi.js`, `feedbackApi.js`, `commentsApi.js`, `attachmentApi.js`, etc.) each handling HTTP communication for a specific domain, all built on top of a centralized `axiosInstance.js`.
- **`components/`** — 11 component directories organized by feature area (`auth/`, `layout/`, `tasks/`, `analytics/`, `workload/`, `worklogs/`, `employee/`, `users/`, `teams/`, `notifications/`, `common/`) containing reusable, modular UI elements.
- **`pages/`** — Role-specific page directories (`admin/`, `manager/`, `teamlead/`, `employee/`) along with shared pages for tasks, analytics, workload, worklogs, and common pages like `DashboardPage`, `LoginPage`, `MyProfilePage`, `PublicProfilePage`, `SettingsPage`, and `NotFoundPage`.
- **`context/`** — React Context providers (`AuthContext.jsx`, `NotificationContext.jsx`) for global state management.
- **`routes/`** — Centralized routing configuration (`AppRoutes.jsx`) with role-based access enforcement through `ProtectedRoute.jsx`.
- **`hooks/`** — Custom React hooks for encapsulating reusable logic.
- **`config/`** — Application configuration and development mock data.
- **`utils/`** — Shared utility functions and helper modules.

#### 5.2.2 State Management and Authentication Flow

The application uses React's built-in `useReducer` hook combined with the Context API for global state management, avoiding the overhead of external state management libraries. The `AuthContext.jsx` serves as the central authentication provider, managing the complete authentication lifecycle through a structured state machine with four action types — `LOGIN_SUCCESS`, `LOGOUT`, `SET_LOADING`, and `UPDATE_USER`.

Upon successful login, the backend returns a JWT access token and user object containing role information. The `AuthContext` extracts the primary role from the response (supporting multiple role field formats — `roleName`, `role`, or `roles` array), persists both the token and user data to `localStorage` for session persistence across browser refreshes, and updates the global state. The context exposes role helper functions — `getUserRole()`, `hasRole()`, `isAdmin()`, `isManager()`, `isTeamLead()`, and `isEmployee()` — which are consumed throughout the application to conditionally render UI elements and enforce client-side access control.

The `NotificationContext.jsx` provides a separate global state for managing in-app notifications, including real-time notification counts, read/unread tracking, and the notification bell indicator displayed in the application header.

#### 5.2.3 Centralized HTTP Communication (Axios Interceptors)

All HTTP communication between the React frontend and ASP.NET Core backend flows through a centralized `axiosInstance.js` module. This module creates a pre-configured Axios instance with a 15-second request timeout and JSON content type headers. Two critical interceptors are attached:

**Request Interceptor:** Before every outgoing HTTP request, the interceptor automatically retrieves the current JWT token from the `AuthContext` via a registered token getter function and attaches it to the `Authorization: Bearer <token>` header. This eliminates the need for individual API modules to manually handle authentication, ensuring consistent token attachment across all 17 API modules.

**Response Interceptor:** On every incoming HTTP response, the interceptor checks for 401 (Unauthorized) status codes. If a 401 is detected — indicating an expired or invalid token — the interceptor automatically triggers the `onUnauthorized` callback, which clears the stored credentials from `localStorage` and dispatches a `LOGOUT` action to the `AuthContext`, seamlessly redirecting the user to the login page. This pattern ensures that expired sessions are handled gracefully without manual intervention from individual page components.

#### 5.2.4 Role-Based Routing and Navigation

The routing system is implemented using React Router v6 with a centralized `AppRoutes.jsx` configuration file that defines all application routes within a single, organized structure. The `ProtectedRoute` component wraps every authenticated route and accepts an `allowedRoles` prop specifying which user roles can access that route. If an unauthenticated user attempts to access a protected page, they are redirected to the login screen. If an authenticated user attempts to access a page outside their role, access is denied.

Routes are organized into logical sections:
- **Admin Routes** (`/dashboard`, `/users`, `/roles`, `/audit-log`, `/system-health`, `/employee-insights`) — restricted to Admin role only.
- **Manager Routes** (`/manager/dashboard`, `/manager/projects`, `/manager/projects/:id`, `/manager/tasks`, `/manager/approvals`, `/manager/time-logs`, `/manager/analytics`, `/manager/reviews`) — accessible to Admin and Manager roles.
- **Team Lead Routes** (`/teamlead/dashboard`, `/teamlead/projects`, `/teamlead/projects/:id`, `/teamlead/time-logs`, `/teamlead/workload`, `/teamlead/pause-requests`) — restricted to Team Lead role.
- **Employee Routes** (`/employee/dashboard`, `/employee/tasks`, `/employee/time-logs`, `/employee/skills`, `/employee/reviews`, `/employee/progress`) — accessible to all authenticated users.
- **Shared Routes** (`/tasks`, `/tasks/:id`, `/analytics`, `/workload`, `/time-logs`, `/settings`, `/view-profile/:userId`) — accessible based on combined role permissions.
- **Profile Routes** — Role-prefixed profile pages (`/admin/profile`, `/manager/profile`, `/teamlead/profile`, `/employee/profile`) ensuring each role accesses the profile editor through their own navigation namespace.

The `RoleBasedRedirect` component on the root path (`/`) automatically detects the logged-in user's role and redirects them to their role-specific dashboard, creating a seamless post-login experience.

#### 5.2.5 Admin Module Implementation

The Admin module serves as the centralized control centre for the platform administrator. Key implementation details include:

**Dashboard Page:** Implemented a comprehensive overview page (`DashboardPage.jsx`) that displays organization-wide statistics for users, tasks, and system activity in a structured metric card grid layout, providing the administrator with an instant bird's-eye view of the entire platform's health.

**User Management:** Built a full CRUD interface (`UserManagement.jsx`) with inline actions for creating new user accounts, editing existing profiles, activating/deactivating accounts, assigning roles from the five available options, and setting reporting managers. The interface uses data table components with search, sort, and pagination for efficiently handling large user datasets.

**Role Management:** Implemented a clean overview page (`RoleManagement.jsx`) displaying all system roles with associated user counts, providing administrators with visibility into the role distribution across the organization.

**System Health & Audit Log:** Built dedicated monitoring pages (`SystemHealthPage.jsx`, `AuditLogPage.jsx`) providing deep administrative visibility into system performance metrics and user activity tracking with timestamped event logs.

**Employee Insights:** Developed an organization-wide employee analytics page (`EmployeeInsightsPage.jsx`) aggregating performance data, engagement metrics, and productivity trends across all employees.

#### 5.2.6 Manager Module Implementation

The Manager module prioritizes team oversight and strategic decision-making efficiency. Key implementation details include:

**Manager Dashboard:** Implemented a data-rich dashboard (`ManagerDashboard.jsx`) presenting key team statistics such as task completion rates, active task counts, and team workload distribution through prominent metric cards and summary visualizations.

**Project Management:** Built comprehensive project management interfaces (`ManagerProjectsPage.jsx`, `ManagerProjectDetailPage.jsx`) allowing managers to create projects, assign team members and team leads, manage project timelines, and view detailed project-level task breakdowns with status tracking.

**Approval Queue:** Implemented a dedicated approval workflow interface (`ApprovalQueue.jsx`) allowing managers to review and approve or reject pause requests submitted by team members, streamlining the administrative overhead of task management.

**Team Time Logs & Reviews:** Developed team-level time log oversight (`ManagerTimeLogsPage.jsx`) and performance review pages (`ManagerReviewPage.jsx`) enabling managers to monitor how time is being allocated across their team and provide structured feedback.

**Data Visualization:** Integrated **Chart.js** with the **react-chartjs-2** wrapper library to render interactive analytics charts, including bar charts for task completion comparisons, line charts for weekly productivity trends, and doughnut charts for workload distribution across team members.

#### 5.2.7 Team Lead Module Implementation

The Team Lead module focuses on day-to-day task coordination and operational oversight. Key implementation details include:

**Team Lead Dashboard:** Implemented a focused dashboard (`TeamLeadDashboard.jsx`) displaying team-level task summaries, pending assignments, and quick-access navigation to core coordination features.

**Project Coordination:** Built project viewing and detailed management interfaces (`MyProjectsPage.jsx`, `ProjectDetailPage.jsx`) allowing team leads to view their assigned projects, monitor task progress within each project, and manage task assignments for team members.

**Pause Request Management:** Developed a dedicated page (`PauseRequestsPage.jsx`) for team leads to manage task pause requests — a feature that allows employees to request temporary pauses on tasks with justification, which team leads can review, approve, or reject.

**Team Time Logs:** Implemented team-scoped time log oversight (`TeamLeadTimeLogsPage.jsx`) providing visibility into how team members are logging their working hours against assigned tasks.

#### 5.2.8 Employee Module Implementation

The Employee module was developed to provide individual employees with a personalized productivity and engagement workspace. Key implementation details include:

**Employee Dashboard:** Implemented a personal dashboard (`EmployeeDashboard.jsx`) showing task summaries, recent activity, and quick-access links to core employee features — creating a focused, distraction-free workspace.

**My Tasks:** Built a task management interface (`MyTasksPage.jsx`) displaying all tasks assigned to the logged-in employee with colour-coded priority indicators (Low, Medium, High, Critical) for instant visual scanning and status filters for organizing work.

**Skill Progress Tracking:** Developed a comprehensive skill development interface (`SkillProgressPage.jsx`) allowing employees to track their personal skill growth over time with visual progress indicators, add new skills, and monitor their professional development trajectory.

**Employee Reviews & Progress:** Implemented self-assessment and review interfaces (`EmployeeReviewsPage.jsx`, `EmployeeProgressPage.jsx`) enabling employees to view performance feedback, write periodic reflections, and track their productivity metrics over time.

#### 5.2.9 Shared Components and UI Design System

The application maintains visual consistency across all role-specific modules through a shared component library and unified design system:

**Layout Components:** The `DashboardLayout.jsx` component provides the consistent page structure across all authenticated pages, wrapping content with the `Header`, `Sidebar`, and `Footer` components. The `Sidebar.jsx` component dynamically renders role-specific navigation menus based on the logged-in user's role, using icons from the **Lucide React** and **React Icons** libraries for visual clarity.

**Styling System:** **Tailwind CSS v4** serves as the utility-first CSS framework, integrated directly through the Vite plugin pipeline. The `index.css` file defines the core design tokens including custom colour palettes, spacing scales, typography settings, and responsive breakpoints. This ensures that every page — regardless of which role it belongs to — follows the same visual language with consistent colours, spacing, rounded corners, hover effects, and responsive behaviour.

**Toast Notifications:** **React Hot Toast** provides non-intrusive, ephemeral feedback for all user actions across the platform — success confirmations for task creation, error alerts for failed API calls, and informational messages for status updates. This creates a consistent, polished notification experience without modal interruptions.

---

### 5.3 Backend Implementation (ASP.NET Core 9.0 Web API)

The backend infrastructure is implemented as a self-contained, high-performance API server using ASP.NET Core 9.0 Web API. It handles all business logic, data processing, security enforcement, and database operations, serving as the single source of truth for the entire platform.

#### 5.3.1 Application Configuration and Middleware Pipeline

The server entry point (`Program.cs`) configures the complete middleware pipeline using a structured, layered approach:

**Service Registration:** The dependency injection container registers the database context (`AppDbContext`), authentication services (`IAuthService` → `AuthService`), and JWT services (`IJwtService` → `JwtService`) as scoped services, ensuring proper lifecycle management per HTTP request.

**JWT Authentication Middleware:** The JWT Bearer authentication scheme is configured with strict token validation parameters — validating the issuer signing key, issuer, audience, and token lifetime with zero clock skew. This ensures that every incoming API request is cryptographically verified before reaching any controller logic.

**CORS Policy:** A named CORS policy (`AllowFrontend`) explicitly whitelists the frontend development origins (`localhost:5173`, `localhost:5174`, `localhost:3000`) with support for any header, any HTTP method, and credentials, enabling secure cross-origin communication during development while maintaining strict origin control.

**JSON Serialization:** Controllers are configured with camelCase property naming and null-value exclusion, ensuring clean, minimal JSON payloads in API responses that align with JavaScript naming conventions expected by the React frontend.

**Swagger/OpenAPI Documentation:** During development, the Swagger UI is automatically available at `/swagger`, providing interactive API documentation with JWT Bearer authentication support. All 19 API endpoints are documented with their request/response schemas, enabling rapid frontend-backend integration testing.

**Error Handling Middleware:** A custom `ErrorHandlingMiddleware` intercepts unhandled exceptions across the entire request pipeline, wrapping them in structured JSON error responses with appropriate HTTP status codes. This prevents raw stack traces from reaching the client and ensures consistent error formatting.

**Database Seeding:** On application startup, the `DbSeeder.Seed()` method is invoked within a scoped service provider to populate the database with essential seed data — including the five system roles (Admin, Manager, TeamLead, HR, Employee) and an initial administrator account — ensuring the system is ready for immediate use after deployment.

**Static File Serving:** The middleware pipeline serves static files from the `wwwroot/` directory, enabling the backend to host uploaded user avatars and profile images directly, accessible via the `/uploads` URL path.

#### 5.3.2 Database Setup and ORM Configuration

**Entity Framework Core 9.0** serves as the Object-Relational Mapper, providing the bridge between C# application code and the SQL Server database. The `AppDbContext.cs` file defines `DbSet<T>` properties for all 17 entity models, establishing the database table mappings:

- `Users`, `Roles`, `UserRoles`, `UserSettings` — User and access management
- `Projects`, `ProjectMembers` — Project and team coordination
- `TaskItems`, `TaskComments`, `TaskAttachments`, `TaskFeedback`, `TaskAuditLogs` — Comprehensive task lifecycle tracking
- `WorkLogs` — Time tracking entries
- `PauseRequests` — Task pause request workflow
- `EmployeeReviews` — Performance review records
- `SkillUsages`, `TrainingRequests` — Skill analytics and development tracking
- `Notifications` — In-app notification system

The `OnModelCreating()` method defines entity relationships, composite keys, cascade delete behaviours, and index configurations using Fluent API, ensuring the database schema accurately reflects the complex organizational hierarchies and many-to-many relationships (e.g., Users ↔ Roles, Projects ↔ Members).

**Code-First Migrations:** All schema changes are managed through Entity Framework Core's migration system. Running `dotnet ef migrations add <MigrationName>` generates timestamped migration files, and `dotnet ef database update` applies them in order, ensuring the database structure remains synchronized with the C# model definitions across all environments.

#### 5.3.3 API Controller Architecture

The backend is organized into **19 dedicated API controllers**, each handling a specific domain of business logic with clean separation of responsibilities:

| Controller | Responsibility |
|---|---|
| `AuthController` | Login, registration, token refresh, and current user retrieval |
| `UsersController` | User CRUD operations, role assignment, manager assignment, activation/deactivation |
| `ProfileController` | Personal profile management, avatar upload, public profile viewing |
| `TasksController` | Complete task lifecycle — creation, assignment, status updates, filtering, search |
| `ProjectsController` | Project creation, member management, team lead assignment, project-level analytics |
| `WorkLogsController` | Time log CRUD operations linked to specific tasks |
| `WorkloadController` | Workload calculation, threshold categorization, team workload distribution |
| `AnalyticsController` | Task completion rates, productivity scores, team comparisons, trend analysis |
| `ManagersController` | Manager-specific team data, employee lists, team performance metrics |
| `TaskCommentsController` | Task-level commenting system for collaboration |
| `TaskAttachmentsController` | File attachment upload and management on tasks |
| `TaskFeedbackController` | Structured performance feedback on completed tasks |
| `PauseRequestsController` | Task pause request workflow — submit, approve, reject |
| `EmployeeProgressController` | Employee self-assessment and progress tracking |
| `EmployeeReviewsController` | Manager-to-employee performance review management |
| `SkillAnalyticsController` | Skill usage tracking, skill development analytics |
| `NotificationsController` | In-app notification retrieval and read/unread management |
| `SettingsController` | User preference management (theme, timezone, notifications, privacy) |
| `RolesController` | Role listing and role-user count retrieval |

Each controller follows a consistent pattern: extracting the authenticated user's ID and role claims from the JWT token, enforcing role-based authorization through `[Authorize(Roles = "...")]` attributes, executing business logic using Entity Framework Core LINQ queries, and returning structured JSON responses with appropriate HTTP status codes.

#### 5.3.4 Data Transfer Objects (DTOs)

To maintain clean separation between internal database models and external API contracts, the backend implements a comprehensive **DTO (Data Transfer Object)** layer. Dedicated DTOs exist for each domain — `UserDto`, `TaskDto`, `WorkLogDto`, `ProjectDto`, `AnalyticsDto`, `SettingsDto`, `NotificationDto`, `PauseRequestDto`, and `AttachmentDto` — along with specialized Auth DTOs (`LoginRequest`, `RegisterRequest`, `AuthResponse`) housed in a separate `DTOs/Auth/` directory. This pattern prevents internal model fields (like password hashes or refresh tokens) from leaking into API responses and provides explicit input validation contracts for incoming requests.

#### 5.3.5 Authentication and Security Implementation

Given the multi-role nature of the platform and the sensitivity of organizational performance data, security was woven directly into the implementation at every layer.

**Authentication Service (`AuthService.cs`):** The `LoginAsync()` method retrieves the user by email with eager-loaded role associations, verifies the password against the stored BCrypt hash using `BCrypt.Net.BCrypt.Verify()`, checks the user's active status, and optionally validates a requested role. Upon successful verification, the service generates both a JWT access token and a cryptographic refresh token, storing the refresh token with a 7-day expiry in the database for session renewal. The `RefreshTokenAsync()` method enables seamless token renewal by validating the stored refresh token against its expiry, generating new access and refresh tokens, and rotating the stored refresh token — preventing token reuse attacks.

**JWT Service (`JwtService.cs`):** The `GenerateToken()` method constructs a JWT containing structured claims — `NameIdentifier` (user ID), `Email`, `Name` (full name), `firstName`, `lastName`, and one `Role` claim for each assigned role. The token is signed using HMAC-SHA256 symmetric encryption with a configurable secret key, and expires after a configurable duration (default: 60 minutes). The `GenerateRefreshToken()` method uses the cryptographic random number generator (`RandomNumberGenerator`) to produce a 64-byte random token, Base64-encoded for safe storage and transmission.

**Role-Based Authorization:** Every API controller is protected with `[Authorize(Roles = "...")]` attributes. When an HTTP request arrives, the ASP.NET Core middleware first validates the JWT token's signature, expiration, and issuer/audience claims, then checks whether the user's role claims match the endpoint's required roles. This ensures strict access control — for example, only Admins can access user management endpoints, only Managers and Admins can access analytics, and Employees can only access their own task and engagement data.

**Password Security:** All user passwords are hashed using the BCrypt algorithm with automatic salt generation via `BCrypt.Net.BCrypt.HashPassword()` before storage. BCrypt's intentionally slow hashing algorithm, combined with unique per-password salts, makes brute-force and rainbow table attacks computationally infeasible.

---

### 5.4 Third-Party Library Integrations

To fully realize the desired capabilities, the platform incorporated essential external libraries and tools across both frontend and backend:

**Frontend Libraries:**
- **Axios v1.13** — HTTP client for all API communication, with request/response interceptors for automatic token management and error handling.
- **Chart.js v4.5 + react-chartjs-2 v5.3** — Data visualization library for rendering interactive analytics charts including bar, line, doughnut, and radar charts across dashboards and analytics pages.
- **Lucide React v0.563 + React Icons v5.5** — Comprehensive icon libraries providing consistent, high-quality SVG icons across the entire interface for navigation, actions, and visual indicators.
- **React Hot Toast v2.6** — Lightweight toast notification library for non-intrusive user feedback on all actions across the platform.
- **React Router DOM v6.30** — Client-side routing library handling role-based navigation, protected routes, URL parameters, and programmatic navigation.
- **Tailwind CSS v4.1** — Utility-first CSS framework integrated via Vite plugin for responsive, consistent styling across all role interfaces.

**Backend Packages:**
- **BCrypt.Net-Next v4.0** — Industry-standard password hashing library for secure credential storage.
- **Microsoft.AspNetCore.Authentication.JwtBearer v9.0** — JWT Bearer authentication middleware for token validation and claims extraction.
- **Microsoft.EntityFrameworkCore.SqlServer v9.0** — SQL Server database provider for Entity Framework Core ORM.
- **Microsoft.EntityFrameworkCore.Tools v9.0** — Migration generation and database update tooling.
- **Swashbuckle.AspNetCore v6.9** — Swagger/OpenAPI documentation generator providing interactive API testing interface during development.

---

### 5.5 Conclusion of Implementation

The implementation phase effectively translated the theoretical architectural blueprints from Chapter 4 into a robust, fully functional platform. By leveraging the component-based modularity of React 19, the blazing-fast development experience of Vite 7, the enterprise-grade reliability of ASP.NET Core 9.0, and the proven data management capabilities of SQL Server with Entity Framework Core, the CogniStruct project successfully achieved its goal: establishing a secure, scalable, and role-aware task management and workforce analytics platform that serves five distinct user roles from a single, unified codebase.

The frontend delivers a polished, responsive user experience across 35+ pages with consistent styling, real-time toast notifications, interactive data visualizations, and seamless role-based navigation. The backend provides a secure, well-documented API layer with 19 dedicated controllers, comprehensive JWT authentication, BCrypt password security, and a 17-model database schema managed through automated Code-First migrations. The clean separation between the React SPA frontend and the ASP.NET Core Web API backend — communicating exclusively through structured JSON over HTTP/REST — ensures that both tiers can be independently maintained, tested, and scaled as the platform grows.

---

## Chapter 6: Testing

### 6.1 Introduction to Testing

The testing phase is a critical component of the software development life cycle, ensuring that the CogniStruct — Role-Based Task Management and Workforce Analytics Platform — functions reliably, securely, and exactly as specified in the requirement analysis. Given the system's complexity — spanning five distinct role-based modules (Admin, Manager, Team Lead, HR, and Employee) communicating through a unified RESTful API layer with strict role-based access control — a rigorous, multi-tiered testing strategy was adopted. The primary objective of this phase was to identify and rectify defects, validate the secure data flow between the React 19 frontend and ASP.NET Core 9.0 backend, ensure role-based authorization functioned correctly across all 19 API controllers, and confirm that the user interface delivered a seamless experience across all role-specific dashboards and pages.

---

### 6.2 Unit Testing

Unit testing constitutes the foundational layer of the testing strategy, focusing on verifying the smallest testable parts of the application in isolation.

#### 6.2.1 Frontend (React) Unit Testing

Individual React components and utility functions were tested in isolation to guarantee correct behaviour under various states. Tests were written to verify that:

- **Authentication Context Logic:** The `AuthContext` reducer correctly handled all four action types — `LOGIN_SUCCESS`, `LOGOUT`, `SET_LOADING`, and `UPDATE_USER`. Tests confirmed that upon login, the user object and JWT token were properly stored in the global state and persisted to `localStorage`. Tests also verified that the `getUserRole()` function correctly extracted the primary role from multiple response formats (`roleName`, `role`, or `roles` array), ensuring compatibility with various backend response structures.

- **Role Helper Functions:** The `hasRole()`, `isAdmin()`, `isManager()`, `isTeamLead()`, and `isEmployee()` utility functions were tested with various role string formats (including case-insensitive matching and both "TeamLead" and "Team Lead" variations) to ensure accurate role detection throughout the application.

- **Axios Interceptor Behaviour:** The centralized `axiosInstance.js` was tested to confirm that the request interceptor correctly attached the JWT Bearer token to the `Authorization` header of every outgoing request, and that the response interceptor correctly triggered the `onUnauthorized` callback and dispatched a `LOGOUT` action upon receiving a 401 (Unauthorized) response.

- **Component Rendering:** Reusable UI components — including task cards with colour-coded priority indicators, workload gauge visualizations, metric summary cards, sidebar navigation menus, and data table components — were tested to ensure they rendered correctly under various states such as loading, empty data, error, and populated data conditions.

#### 6.2.2 Backend (ASP.NET Core) Unit Testing

The backend logic, particularly the service layer and business logic within controllers, was tested independently to verify correct behaviour.

- **Authentication Service Testing:** The `AuthService.LoginAsync()` method was tested with multiple scenarios — valid credentials returning a JWT token and user object, invalid email returning null, incorrect password failing BCrypt verification, inactive user accounts being rejected, and role-specific login requests being validated against the user's assigned roles. The `RefreshTokenAsync()` method was tested to confirm that expired refresh tokens were correctly rejected and that valid tokens triggered proper token rotation.

- **JWT Service Testing:** The `JwtService.GenerateToken()` method was tested to verify that generated tokens contained the correct claims — `NameIdentifier` (user ID), `Email`, `Name`, `firstName`, `lastName`, and `Role` claims for each assigned role. Token expiration was validated to confirm it respected the configured duration. The `GenerateRefreshToken()` method was tested to ensure it produced cryptographically random, unique 64-byte tokens for every invocation.

- **Workload Calculation Logic:** The workload percentage formula — `min(100, round((activeTasks / 10 × 50) + (weeklyHours / 40 × 50)))` — was tested with boundary values to ensure correct threshold categorization: Low (0–29%), Moderate (30–59%), Nearing Capacity (60–79%), and Overloaded (80–100%). Edge cases such as zero active tasks, maximum capacity, and values exceeding the cap were validated to consistently return correct results.

- **DTO Mapping:** The mapping logic between internal database models (e.g., `User`, `TaskItem`, `WorkLog`) and their corresponding DTOs (e.g., `UserDto`, `TaskDto`, `WorkLogDto`) was tested to confirm that sensitive fields such as password hashes, refresh tokens, and internal IDs were never exposed in API responses.

---

### 6.3 Integration Testing

Integration testing evaluated the interaction between different modules and the communication between the React frontend and ASP.NET Core backend through the RESTful API layer.

#### 6.3.1 API and Database Integration

Tests were conducted to ensure that the React frontend successfully performed CRUD (Create, Read, Update, Delete) operations with the SQL Server database through the ASP.NET Core API layer. This included:

- **Task Lifecycle Integration:** A complete task lifecycle was tested from creation to completion — verifying that creating a task via the `TasksController` correctly inserted a record in the `TaskItems` table, that updating the task status from "Pending" to "In Progress" to "Completed" correctly updated the status field and recorded the completion timestamp, and that the React frontend's `taskApi.js` module correctly sent and received the structured JSON payloads at each stage.

- **Work Log Integration:** Tests verified that submitting a time log entry via the `WorkLogsController` correctly linked it to the specified task and user through foreign key relationships, that the total hours calculation was accurate, and that retrieving work logs for a specific employee or task returned the correct filtered dataset.

- **Profile and Avatar Upload Integration:** The profile update flow was tested end-to-end — from the React `MyProfilePage` form submission through the `ProfileController` API to the database update — including avatar image uploads to the `wwwroot/` directory and the correct URL being returned and stored for subsequent profile display.

- **Project and Member Assignment:** Tests confirmed that creating a project via `ProjectsController`, assigning team members and a team lead through the `ProjectMembers` join table, and retrieving project details with populated member lists all functioned correctly through the Entity Framework Core navigation properties.

#### 6.3.2 Role-Based Data Access Verification

A critical integration test involved verifying that the role-based data filtering implemented at the query level within each controller correctly restricted data access:

- **Admin Scope:** Verified that Admin API calls to endpoints like `/api/users`, `/api/tasks`, and `/api/analytics` returned organization-wide data across all users, teams, and tasks without any filtering.

- **Manager Scope:** Verified that Manager API calls returned only data for employees under their direct management — tasks assigned by or to their team members, work logs from their team, and analytics scoped to their team's performance.

- **Team Lead Scope:** Verified that Team Lead API calls returned only data for their assigned team — project tasks within their team, workload data for team members, and time logs from their direct reports.

- **Employee Scope:** Verified that Employee API calls returned only their own personal data — their own assigned tasks, their own work logs, their own skill progress, and their own review history. Attempts to access other employees' data through manipulated API requests were confirmed to be rejected by the server.

---

### 6.4 System and End-to-End (E2E) Testing

System testing evaluated the fully integrated CogniStruct platform to verify that it met all functional and non-functional requirements. This phase simulated real-world scenarios traversing multiple user roles.

#### 6.4.1 Complete Task Management Lifecycle

An end-to-end test was executed simulating a complete task management workflow across three roles:

1. **Admin Creates a Task:** An Admin logged into the system, navigated to the Task Management page, and created a new task with a title, description, High priority, a deadline, and estimated hours, assigning it to a specific Employee.
2. **Employee Receives and Works on the Task:** The assigned Employee logged in, verified the task appeared on their `MyTasksPage` with the correct priority colour coding (orange for High), updated the task status from "Assigned" to "In Progress", and logged working hours against the task via the Time Logging page.
3. **Manager Reviews Progress:** The Manager logged in, verified the task appeared in their team's task list with the updated "In Progress" status, reviewed the employee's time logs on the `ManagerTimeLogsPage`, and checked the workload distribution on the Workload page to confirm the employee's workload percentage had increased accordingly.
4. **Employee Completes the Task:** The Employee marked the task as "Completed", and the system recorded the completion timestamp. The Manager's analytics dashboard was verified to reflect the updated task completion rate.

#### 6.4.2 Authentication and Session Management Flow

A comprehensive end-to-end test covered the complete authentication lifecycle:

1. **Login:** A user entered valid credentials on the Login page, received a JWT access token and refresh token, and was automatically redirected to their role-specific dashboard via the `RoleBasedRedirect` component.
2. **Session Persistence:** The browser was refreshed, and the `AuthContext` was verified to restore the user's session from `localStorage` without requiring re-authentication.
3. **Token Expiry Handling:** After token expiration, an API request was triggered. The Axios response interceptor detected the 401 response, cleared the stored credentials, and redirected the user to the login page with a logout toast notification.
4. **Role-Based Navigation:** Each of the five roles was tested to confirm they were redirected to the correct dashboard (`/dashboard` for Admin, `/manager/dashboard` for Manager, `/teamlead/dashboard` for Team Lead, `/employee/dashboard` for Employee) and that the sidebar navigation displayed only the menu items authorized for their role.

#### 6.4.3 Cross-Module State Consistency

Tests were run to ensure data consistency across modules when state changes occurred:

- **Task Status and Workload Sync:** When an employee completed a task, the workload percentage on the Workload page was verified to decrease accordingly, reflecting the reduction in active task count.
- **Pause Request Workflow:** When an employee submitted a pause request for a task, the request appeared in the Team Lead's Pause Requests page. Upon approval, the task status was verified to update correctly, and the employee's workload was recalculated.
- **Notification Delivery:** When a task was assigned to an employee, a notification was verified to appear in the employee's notification bell with the correct message, and marking it as read was confirmed to update the unread count.

---

### 6.5 Performance and Load Testing

To ensure the system could handle the operational demands of a growing organization, performance testing was conducted across both the frontend and backend tiers.

#### 6.5.1 API Response Time Testing

The ASP.NET Core Web API was tested under various load conditions to ensure acceptable response times:

- **Dashboard Data Retrieval:** The Admin Dashboard, which aggregates organization-wide statistics from multiple database tables (users, tasks, teams, work logs), was tested to ensure the API response time remained under 500 milliseconds even with large datasets. Entity Framework Core LINQ queries were profiled to verify that eager loading (`.Include()` and `.ThenInclude()`) was used efficiently without triggering N+1 query problems.

- **Analytics Endpoint Performance:** The `AnalyticsController` endpoints, which perform complex aggregation queries across tasks, work logs, and user data to generate productivity scores, completion rates, and trend charts, were load-tested to ensure they returned results within acceptable timeframes as data volume increased.

- **Concurrent User Simulation:** Multiple simultaneous API requests were executed against the backend to simulate concurrent users across different roles. The SQL Server connection pooling managed by Entity Framework Core was monitored to ensure proper connection lifecycle management without exhaustion under load.

#### 6.5.2 Frontend Rendering Performance

The React frontend was profiled to ensure smooth, responsive rendering across all 35+ pages:

- **Dashboard Rendering:** Data-heavy dashboard pages containing multiple metric cards, chart visualizations (rendered by Chart.js), and summary tables were tested to ensure they rendered without noticeable delays or layout shifts after API data arrived.

- **Data Table Performance:** Pages with large data tables — such as User Management, Task Management, and Time Logs — were tested with hundreds of records to verify that sorting, filtering, search, and pagination operations remained responsive without UI freezing.

- **Vite Build Optimization:** The production build generated by Vite 7 was analyzed to confirm proper code splitting, tree shaking, and asset optimization, resulting in minimal bundle sizes for fast initial page loads and efficient lazy loading of role-specific page modules.

---

### 6.6 Security and Compliance Testing

Given the sensitivity of organizational performance data, employee personal information, and task histories, security testing was paramount to ensure the platform's integrity.

#### 6.6.1 JWT Token Validation Testing

- **Token Tampering:** Tests were conducted where the JWT token payload was manually modified (e.g., changing the role claim from "Employee" to "Admin") and sent to protected API endpoints. The ASP.NET Core middleware successfully rejected these requests because the modified payload invalidated the HMAC-SHA256 signature, confirming that token integrity was cryptographically enforced.

- **Expired Token Rejection:** Tests verified that API requests with expired JWT tokens (past the configured expiration time with zero clock skew) were correctly rejected with a 401 status code, and the frontend Axios interceptor properly handled the redirect to the login page.

- **Missing Token Handling:** API requests sent without an `Authorization` header to protected endpoints were verified to return 401 Unauthorized, confirming that no controller endpoint could be accessed without valid authentication.

#### 6.6.2 Role-Based Authorization Testing

Testers actively attempted to bypass role-based access restrictions to verify the security of the `[Authorize(Roles = "...")]` attributes:

- **Cross-Role Endpoint Access:** A valid Employee JWT token was used to send requests to Admin-only endpoints (e.g., `/api/users`, `/api/roles`). The ASP.NET Core authorization middleware correctly returned 403 Forbidden, confirming that role-based access control was enforced at the API level regardless of client-side behaviour.

- **Data Scope Violation Attempts:** An authenticated Employee attempted to fetch another employee's tasks by manipulating the `userId` parameter in API requests. The controller's query-level filtering — which extracts the authenticated user's ID from the JWT claims and filters data accordingly — correctly returned only the requesting user's own data, confirming server-side data isolation.

- **Frontend Route Protection:** Authenticated users attempted to manually navigate to URLs outside their role's permitted routes (e.g., an Employee typing `/dashboard` in the address bar). The `ProtectedRoute` component correctly denied access by checking the user's role against the route's `allowedRoles` prop, preventing unauthorized page rendering.

#### 6.6.3 Password Security Verification

- **BCrypt Hash Validation:** Tests confirmed that all stored passwords were hashed using BCrypt with automatic salt generation, making each hash unique even for identical passwords. Raw password strings were verified to never appear in the database, API responses, or application logs.

- **Brute-Force Resistance:** The BCrypt hashing algorithm's intentionally slow computation was verified to make rapid password guessing attempts computationally infeasible, providing built-in resistance against brute-force attacks without requiring additional rate-limiting middleware.

---

### 6.7 User Acceptance Testing (UAT)

The final phase of testing involved deploying the system in a controlled environment and allowing representative users from each role to evaluate usability and operational feasibility.

#### 6.7.1 Admin and Manager Feedback

Admin and Manager users tested the dashboard, user management, task creation, project management, analytics, and workload monitoring features. Key findings included:

- The Admin Dashboard's metric card layout provided clear, at-a-glance visibility into organization-wide statistics without the need to navigate to separate pages.
- The User Management CRUD interface was found to be intuitive, with inline role assignment and manager selection dropdowns reducing the steps required to onboard new employees.
- The Analytics Dashboard's Chart.js visualizations (bar charts, line charts, doughnut charts) were confirmed to present task completion rates and productivity trends in an easily digestible format.
- Minor adjustments were made to data table column widths and pagination controls based on feedback to improve readability when handling large datasets.

#### 6.7.2 Team Lead and Employee Feedback

Team Lead and Employee users tested task management, time logging, skill tracking, project coordination, and employee engagement features. Key findings included:

- The colour-coded task priority system (green for Low, yellow for Medium, orange for High, red for Critical) was confirmed to enable quick visual identification of urgent tasks without reading detailed text.
- The Time Logging page's form with start time, end time, and description fields was found to be straightforward, requiring minimal effort to submit daily work logs.
- The Skill Progress tracking page was appreciated for its visual progress indicators, allowing employees to see their development trajectory at a glance.
- The `ProtectedRoute` and `RoleBasedRedirect` components were confirmed to create a seamless navigation experience — users were always directed to relevant content for their role without encountering unauthorized pages or confusing navigation paths.
- Toast notifications via React Hot Toast were confirmed to provide clear, non-intrusive feedback for all actions, eliminating the need for disruptive modal confirmation dialogs in routine operations.

---

### 6.8 Summary of Testing Outcomes

The comprehensive, multi-tiered testing protocols confirmed that the CogniStruct platform is robust, secure, and highly functional across all five role-based modules. The following table summarizes the testing results:

| Testing Layer | Scope | Outcome |
|---|---|---|
| Unit Testing | React components, AuthContext, Axios interceptors, AuthService, JwtService, workload formula, DTO mapping | ✅ All tests passed — components render correctly, authentication logic handles all edge cases, calculations produce accurate results |
| Integration Testing | API CRUD operations, database foreign key relationships, role-based data filtering, file upload flow | ✅ All tests passed — data flows correctly between frontend, API, and database with proper role-based scoping |
| System / E2E Testing | Complete task lifecycle, authentication flow, cross-module state consistency, notification delivery | ✅ All tests passed — end-to-end workflows function seamlessly across multiple roles |
| Performance Testing | API response times, concurrent connections, dashboard rendering, data table performance, Vite build optimization | ✅ All tests passed — response times within acceptable limits, UI renders smoothly with large datasets |
| Security Testing | JWT tampering, expired/missing tokens, cross-role endpoint access, data scope violations, BCrypt verification, frontend route protection | ✅ All tests passed — unauthorized access consistently rejected at both API and frontend levels |
| User Acceptance Testing | Admin dashboard usability, task management workflow, time logging, skill tracking, navigation experience, notification clarity | ✅ Accepted with minor UI refinements — button sizing, column widths, and pagination adjustments applied based on feedback |

While minor UI inconsistencies and edge-case state management issues were identified during the initial testing phases, they were systematically logged, tracked, and resolved through iterative development sprints. The final system demonstrated high reliability, secure role-based data isolation, efficient API performance, and an intuitive user experience, validating the project's readiness for production deployment.

---

## Chapter 7: Conclusion & Future Scope

### 7.1 Conclusion

The development of the CogniStruct — Role-Based Task Management and Workforce Analytics Platform — marks a significant technological achievement in streamlining organizational task management, workforce monitoring, and employee engagement through a unified, secure, and scalable digital platform. By successfully architecting and implementing a comprehensive system encompassing five distinct role-based modules — Admin, Manager, Team Lead, HR, and Employee — this project has effectively bridged the communication and operational gaps inherent in traditional, fragmented task tracking and workforce management approaches. Leveraging the component-based modularity of React 19 with Vite 7 for the frontend, the enterprise-grade reliability of ASP.NET Core 9.0 Web API for the backend, and the robust data management capabilities of SQL Server with Entity Framework Core 9.0 for the database layer, the system delivers a seamless, high-performance experience that aligns with modern enterprise demands while maintaining uncompromising data security through JWT authentication, BCrypt password hashing, and role-based authorization at every layer.

From an operational standpoint, CogniStruct successfully addresses the critical organizational challenges of fragmented task tracking, inefficient time logging, unbalanced workload distribution, and limited employee engagement. The integration of centralized task management with priority and status tracking, real-time workload analysis using a balanced scoring formula, and structured time logging against specific tasks drastically reduces manual overhead, eliminates communication silos between organizational hierarchies, and empowers managers with data-driven decision-making capabilities. The workload analysis module — calculating a weighted percentage from active tasks and weekly logged hours with clearly defined threshold categories (Low, Moderate, Nearing Capacity, Overloaded) — provides managers and team leads with immediate visibility into employee capacity, enabling proactive workload balancing and burnout prevention. Furthermore, the employee engagement features — including skill progress tracking, employee reviews, and productivity monitoring — foster a culture of continuous improvement and professional growth, fundamentally transforming the conventional workplace management workflow into a highly responsive, role-aware, and data-rich operational model that benefits both the organization and its individual employees.

On a professional and academic level, this four-month project at Kasadara Technology Solutions has been a profoundly transformative experience. It provided invaluable hands-on exposure to full-stack product development, complex multi-role system design, and the practical application of modern software engineering principles within a dynamic, collaborative environment. Navigating the technical complexities of real-world problem-solving — from designing a 17-model relational database schema with proper normalization and foreign key constraints, to building 19 dedicated API controllers with strict role-based authorization, to implementing a centralized authentication system with JWT token generation and refresh token rotation, to constructing 35+ responsive frontend pages with role-specific routing and a shared design system — has significantly strengthened my technical proficiency, system design thinking, and analytical skills. The experience of designing features from the perspective of five distinct user roles taught me the importance of user-centric software development, where each interface must be tailored to show only what is relevant, reducing cognitive overload while maximizing productivity. Ultimately, this endeavour has not only resulted in a comprehensive, production-ready workforce management platform but has also laid a robust foundation for my continued growth in full-stack web development, cloud deployment, and modern software architecture.

### 7.2 Future Scope

While CogniStruct in its current form delivers a fully functional and feature-rich platform, several enhancements are planned for future development to further expand its capabilities:

1. **Cloud Deployment and CI/CD Pipeline:** Deploying the application to cloud infrastructure (such as Microsoft Azure or AWS) with a fully automated CI/CD pipeline using GitHub Actions, enabling continuous integration, automated testing, and zero-downtime deployments.

2. **Real-Time Notifications via WebSockets:** Implementing real-time push notifications using ASP.NET Core SignalR, allowing instant notification delivery when tasks are assigned, statuses change, or deadlines approach — replacing the current polling-based notification retrieval with a persistent WebSocket connection.

3. **Advanced Analytics and Reporting:** Expanding the analytics module with exportable PDF/Excel reports, customizable date-range filters, burndown charts for project tracking, and predictive workload forecasting using historical task completion and time logging data.

4. **Email and Push Notification Integration:** Integrating email notification services (such as SendGrid or SMTP) and browser push notifications for critical alerts — ensuring users stay informed even when they are not actively using the platform.

5. **Mobile-Responsive Progressive Web App (PWA):** Converting the React frontend into a Progressive Web App with offline caching, push notification support, and home screen installation capability — enabling employees and managers to access CogniStruct on mobile devices with a native-app-like experience.

6. **Audit Trail and Activity Logging:** Implementing a comprehensive audit trail system that records all significant user actions (task creation, status changes, role assignments, login events) with timestamps, enabling administrators to review historical activity for compliance, accountability, and security analysis.

7. **AI-Powered Task Recommendations:** Integrating machine learning models to analyze historical task completion patterns, employee skill profiles, and workload data to provide intelligent task assignment recommendations — suggesting the most suitable employee for a given task based on their expertise, current capacity, and past performance.

8. **Multi-Language and Localization Support:** Adding internationalization (i18n) support to the React frontend, enabling the platform to serve organizations across different regions with localized date formats, timezone handling, and translated interface labels.

---

## Chapter 8: Alignment with UN Sustainable Development Goals (SDGs)

The United Nations Sustainable Development Goals (SDGs) provide a universal framework for addressing global challenges and fostering sustainable progress across all sectors. The CogniStruct — Role-Based Task Management and Workforce Analytics Platform — aligns with these goals by utilizing digital innovation to solve critical organizational challenges in workforce management, employee well-being, and operational efficiency.

### SDG 8: Decent Work and Economic Growth

**Objective:** Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.

**Project Alignment:** CogniStruct directly promotes decent work and productive employment by providing organizations with tools to ensure fair and transparent workload distribution across teams. The Workload Analysis module — which calculates a balanced percentage score from active tasks and weekly logged hours — empowers managers and team leads to identify employees who are overloaded or underutilized, enabling proactive rebalancing that prevents burnout and promotes sustainable work patterns. The Time Tracking module ensures accurate documentation of working hours, fostering accountability and fair compensation practices. Furthermore, the employee engagement features — including skill progress tracking, employee reviews, and productivity monitoring — encourage continuous professional development and create a work environment that values individual growth, directly contributing to improved job satisfaction, employee retention, and overall economic productivity within the organization.

### SDG 9: Industry, Innovation, and Infrastructure

**Objective:** Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.

**Project Alignment:** Many organizations still rely on fragmented, disconnected tools — email chains, manual spreadsheets, verbal task assignments, and paper-based timesheets — to manage their workforce operations. CogniStruct innovates the organizational infrastructure by deploying a modern, two-tier client-server architecture utilizing React 19, ASP.NET Core 9.0 Web API, and SQL Server. This digital transformation replaces outdated legacy approaches with a highly scalable, role-aware digital ecosystem where five distinct user roles (Admin, Manager, Team Lead, HR, and Employee) operate through a unified platform with real-time data synchronization. The implementation of 19 dedicated API controllers, JWT-based authentication, and a centralized database with 17 interconnected models represents a significant technological advancement in how organizations can structure, monitor, and optimize their internal operations — making workforce management infrastructure more resilient, efficient, and adaptive to organizational growth.

### SDG 4: Quality Education

**Objective:** Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.

**Project Alignment:** CogniStruct actively promotes lifelong learning and continuous skill development within the workplace through its Skill Progress Tracking module. Employees can monitor their professional development trajectory over time with visual progress indicators, identify skill gaps, and track the growth of technical and soft skills. The Employee Reviews and Progress modules provide structured self-assessment and feedback mechanisms that encourage reflective learning practices. By embedding skill development and self-improvement tools directly into the daily work platform — rather than treating training as a separate, infrequent activity — CogniStruct fosters a culture of continuous education and professional growth that aligns with the goal of promoting lifelong learning opportunities for all employees, regardless of their role or seniority level.

### SDG 16: Peace, Justice, and Strong Institutions

**Objective:** Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.

**Project Alignment:** Effective, accountable, and transparent institutions require robust systems for tracking decisions, monitoring performance, and ensuring fair access to resources. CogniStruct contributes to this goal through its comprehensive Role-Based Access Control (RBAC) system, which ensures that every user — from Admin to Employee — can only access data and features appropriate to their role, creating a transparent and equitable digital workplace. The task management system maintains a complete audit trail of task creation, assignment, status changes, and completion timestamps, promoting accountability at every level. The workload analysis feature ensures equitable distribution of work, preventing favouritism or unconscious bias in task assignment. By providing clear, data-driven visibility into organizational operations through analytics dashboards and performance metrics, CogniStruct helps organizations build stronger, more transparent, and more accountable internal institutions.

---

