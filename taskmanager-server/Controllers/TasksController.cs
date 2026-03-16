using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    // All authenticated users can view tasks (employees see only their own)
    [Authorize(Roles = "Admin,Manager,TeamLead,Employee")]
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? priority)
    {
        var query = _db.Tasks.AsQueryable();

        // Role-based filtering
        var isAdmin = User.IsInRole("Admin");
        var isManager = User.IsInRole("Manager");
        var isTeamLead = User.IsInRole("TeamLead") || User.IsInRole("Team Lead");

        if (!isAdmin && !isManager)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
            {
                if (isTeamLead)
                {
                    // TeamLead sees tasks from projects where they are a member + tasks assigned to them
                    var memberProjectIds = await _db.ProjectMembers
                        .Where(pm => pm.UserId == currentUserId)
                        .Select(pm => pm.ProjectId)
                        .ToListAsync();

                    query = query.Where(t =>
                        t.AssigneeId == currentUserId ||
                        (t.ProjectId != null && memberProjectIds.Contains(t.ProjectId.Value))
                    );
                }
                else
                {
                    // Employee sees only tasks assigned to them
                    query = query.Where(t => t.AssigneeId == currentUserId);
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));

        if (!string.IsNullOrWhiteSpace(status) && int.TryParse(status, out var s))
            query = query.Where(t => t.Status == s);

        if (!string.IsNullOrWhiteSpace(priority) && int.TryParse(priority, out var p))
            query = query.Where(t => t.Priority == p);

        var tasks = await query.OrderByDescending(t => t.CreatedDate)
            .Select(t => new TaskDto
            {
                Id = t.TaskId,
                Title = t.Title,
                Description = t.Description,
                AssigneeId = t.AssigneeId,
                AssigneeName = t.Assignee != null ? t.Assignee.FirstName + " " + t.Assignee.LastName : null,
                AssignerId = t.AssignerId,
                AssignerName = t.Assigner != null ? t.Assigner.FirstName + " " + t.Assigner.LastName : null,
                Priority = t.Priority,
                Status = t.Status,
                Deadline = t.Deadline,
                EstimatedHours = t.EstimatedHours,
                CreatedDate = t.CreatedDate,
                UpdatedDate = t.UpdatedDate,
                CompletedDate = t.CompletedDate,
                PausedAt = t.PausedAt,
                PauseReason = t.PauseReason,
                RequiredSkills = t.RequiredSkills,
                TotalLoggedHours = t.WorkLogs != null ? t.WorkLogs.Sum(w => w.TotalHours) : 0,
                ParentTaskId = t.ParentTaskId,
                IsProject = t.ParentTaskId == null,
                SubTaskCount = t.SubTasks.Count,
                CompletedSubTaskCount = t.SubTasks.Count(st => st.Status == 3),
                TeamName = t.Project != null && t.Project.Team != null ? t.Project.Team.TeamName : null
            }).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.WorkLogs)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null) return NotFound();

        // ── Employee access guard: own tasks only ──
        var currentUserId = GetCurrentUserId();
        if (User.IsInRole("Employee") && !User.IsInRole("Admin") && !User.IsInRole("Manager") && !User.IsInRole("TeamLead"))
        {
            if (task.AssigneeId != currentUserId)
                return StatusCode(403, new { message = "You can only view tasks assigned to you." });
        }

        var dto = MapToDto(task);
        return Ok(dto);
    }

    // Admin, Manager, TeamLead can create tasks (role-branched)
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var currentUserId = GetCurrentUserId();
        var isManager = User.IsInRole("Manager") || User.IsInRole("Admin");
        var isTeamLead = User.IsInRole("TeamLead") || User.IsInRole("Team Lead");

        // ══════════════════════════════════════════════
        // A. MANAGER PATH — Create Parent Task (Project)
        // ══════════════════════════════════════════════
        if (isManager)
        {
            // Manager CANNOT create subtasks
            if (request.ParentTaskId.HasValue)
                return BadRequest(new { message = "Managers can only create projects (parent tasks). Do not specify ParentTaskId." });

            // Assignee must be a TeamLead
            if (!request.AssigneeId.HasValue)
                return BadRequest(new { message = "Assignee (TeamLead) is required." });

            var assignee = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == request.AssigneeId.Value);
            if (assignee == null || !assignee.IsActive)
                return BadRequest(new { message = "Assignee does not exist or is inactive." });

            var assigneeIsTeamLead = assignee.UserRoles.Any(ur =>
                ur.Role.RoleName == "TeamLead" || ur.Role.RoleName == "Team Lead");
            if (!assigneeIsTeamLead)
                return BadRequest(new { message = "Manager can only assign projects to a TeamLead." });
        }
        // ══════════════════════════════════════════════
        // B. TEAMLEAD PATH — Create SubTask
        // ══════════════════════════════════════════════
        else if (isTeamLead)
        {
            // If ProjectId is provided but ParentTaskId is not, auto-resolve the parent task
            if (!request.ParentTaskId.HasValue && request.ProjectId.HasValue)
            {
                var projectRootTask = await _db.Tasks
                    .Where(t => t.ProjectId == request.ProjectId.Value && t.ParentTaskId == null)
                    .FirstOrDefaultAsync();

                // Auto-create root TaskItem if project exists but has no linked task
                if (projectRootTask == null)
                {
                    var proj = await _db.Projects.Include(p => p.Lead).FirstOrDefaultAsync(p => p.ProjectId == request.ProjectId.Value);
                    if (proj != null)
                    {
                        projectRootTask = new TaskItem
                        {
                            Title = proj.Name,
                            Description = proj.Description ?? string.Empty,
                            AssigneeId = proj.LeadId,
                            AssignerId = proj.CreatedByManagerId,
                            Priority = 1,
                            Status = 1, // Assigned
                            ProjectId = proj.ProjectId,
                            ParentTaskId = null,
                            CreatedDate = DateTime.UtcNow,
                            UpdatedDate = DateTime.UtcNow
                        };
                        _db.Tasks.Add(projectRootTask);
                        await _db.SaveChangesAsync();
                    }
                }

                if (projectRootTask != null)
                    request.ParentTaskId = projectRootTask.TaskId;
            }

            // TeamLead MUST specify a parent task
            if (!request.ParentTaskId.HasValue)
                return BadRequest(new { message = "TeamLead can only create subtasks. ParentTaskId is required." });

            var parent = await _db.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == request.ParentTaskId.Value);
            if (parent == null)
                return BadRequest(new { message = "Parent task not found." });

            // Prevent sub-subtasks
            if (parent.ParentTaskId != null)
                return BadRequest(new { message = "Cannot create sub-subtasks. Only one level of hierarchy allowed." });

            // Block subtask under completed parent
            if (parent.Status == 3)
                return BadRequest(new { message = "Cannot create subtask under a completed project." });

            // Block subtask under paused parent
            if (parent.Status == 4)
                return BadRequest(new { message = "Cannot create subtask under a paused project. Resume the project first." });

            // TeamLead must own the parent task
            if (parent.AssigneeId != currentUserId)
                return StatusCode(403, new { message = "You can only create subtasks under projects assigned to you." });

            // Validate assignee
            if (!request.AssigneeId.HasValue)
                return BadRequest(new { message = "Assignee is required." });

            var assignee = await _db.Users
                .Include(u => u.AssignedTasks)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == request.AssigneeId.Value);
            if (assignee == null || !assignee.IsActive)
                return BadRequest(new { message = "Assignee does not exist or is inactive." });

            // Subtasks can only be assigned to Employees
            var assigneeRoles = assignee.UserRoles.Select(ur => ur.Role.RoleName).ToList();
            if (!assigneeRoles.Contains("Employee"))
                return BadRequest(new { message = "Subtasks can only be assigned to employees." });

            // Validate assignee is a member of the project
            if (parent.ProjectId.HasValue)
            {
                var isProjectMember = await _db.ProjectMembers
                    .AnyAsync(pm => pm.ProjectId == parent.ProjectId.Value && pm.UserId == request.AssigneeId.Value);
                if (!isProjectMember)
                    return BadRequest(new { message = "Assignee must be a member of the project. Only project members can be assigned tasks." });
            }


            // Required skills are mandatory for subtasks
            if (string.IsNullOrWhiteSpace(request.RequiredSkills))
                return BadRequest(new { message = "A subtask must include at least one required skill. Skills are used for AI assignment and skill tracking." });

            // ── Critical escalation: workload warning ──
            if (request.Priority == 3) // Critical
            {
                var activeTasks = assignee.AssignedTasks
                    .Where(t => t.Status != 3 && t.ParentTaskId != null).ToList();
                var totalEffort = activeTasks.Sum(t => t.EstimatedHours);
                var projectedEffort = totalEffort + request.EstimatedHours;
                var workloadPct = (int)Math.Min(100, Math.Round((projectedEffort / 40.0) * 100));

                if (workloadPct >= 80)
                {
                    // Get IDs of tasks that already have a pending PauseRequest
                    var existingPendingTaskIds = await _db.PauseRequests
                        .Where(p => p.Status == 0)
                        .Select(p => p.TaskId)
                        .ToListAsync();

                    // Create PauseRequest entries for lower-priority tasks
                    var pauseCandidates = activeTasks
                        .Where(t => t.Status != 4) // §2: Not already paused
                        .Where(t => !existingPendingTaskIds.Contains(t.TaskId)) // §1: No duplicate pending request
                        .OrderBy(t => t.Priority)
                        .ThenByDescending(t => t.Deadline ?? DateTime.MaxValue)
                        .Take(3)
                        .ToList();

                    foreach (var candidate in pauseCandidates)
                    {
                        _db.PauseRequests.Add(new PauseRequest
                        {
                            TaskId = candidate.TaskId,
                            EmployeeId = request.AssigneeId.Value,
                            RequestedByUserId = currentUserId,
                            Reason = $"Workload escalation: new Critical task assigned. Projected workload {workloadPct}%.",
                            Status = 0, // Pending
                            IsSystemGenerated = true // §3: System-generated flag
                        });
                    }
                    // PauseRequests saved together with the task below
                }
            }
        }
        else
        {
            return StatusCode(403, new { message = "Unauthorized role for task creation." });
        }

        // ── Create task ──
        // Determine ProjectId: from parent task, or from request
        int? projectId = request.ProjectId;
        if (!projectId.HasValue && request.ParentTaskId.HasValue)
        {
            var parentForProject = await _db.Tasks.FindAsync(request.ParentTaskId.Value);
            projectId = parentForProject?.ProjectId;
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            AssigneeId = request.AssigneeId,
            AssignerId = currentUserId,
            Priority = request.Priority,
            Status = 0, // Pending
            Deadline = request.Deadline,
            EstimatedHours = request.EstimatedHours,
            RequiredSkills = request.RequiredSkills,
            ParentTaskId = request.ParentTaskId,
            ProjectId = projectId,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Reload with includes
        task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.SubTasks)
            .FirstAsync(t => t.TaskId == task.TaskId);

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = task.TaskId,
            PerformedByUserId = currentUserId,
            Action = task.ParentTaskId == null ? "project_created" : "subtask_created",
            Details = $"Title: {task.Title}. Assigned to UserId: {task.AssigneeId}."
        });

        // Create notification for assignee
        if (task.AssigneeId.HasValue)
        {
            var assignerName = task.Assigner != null
                ? $"{task.Assigner.FirstName} {task.Assigner.LastName}"
                : "System";
            Services.NotificationService.TaskAssigned(_db, task.AssigneeId.Value, task.Title, task.TaskId, assignerName);
        }
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.TaskId }, MapToDto(task));
    }

    // ═══════════════════════════════════════════════════
    // PATCH /api/tasks/projects/{id} — Manager only
    // ═══════════════════════════════════════════════════
    [Authorize(Roles = "Manager")]
    [HttpPatch("projects/{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        // Must be a project (no parent)
        if (task.ParentTaskId != null)
            return BadRequest(new { message = "Managers can only update projects, not subtasks." });

        // Manager must be the creator of the project
        var currentUserId = GetCurrentUserId();
        if (task.AssignerId != currentUserId)
            return StatusCode(403, new { message = "You can only update projects you created." });

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.Priority = request.Priority ?? task.Priority;
        task.Deadline = request.Deadline ?? task.Deadline;
        task.UpdatedDate = DateTime.UtcNow;

        // Manager can set SLA
        if (request.SlaHours.HasValue)
            task.SlaHours = request.SlaHours.Value;

        await _db.SaveChangesAsync();

        task = await _db.Tasks
            .Include(t => t.Assignee).Include(t => t.Assigner).Include(t => t.SubTasks)
            .FirstAsync(t => t.TaskId == id);

        return Ok(MapToDto(task));
    }

    // ═══════════════════════════════════════════════════
    // PATCH /api/tasks/subtasks/{id} — TeamLead only
    // ═══════════════════════════════════════════════════
    [Authorize(Roles = "TeamLead,Team Lead")]
    [HttpPatch("subtasks/{id}")]
    public async Task<IActionResult> UpdateSubtask(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _db.Tasks.Include(t => t.ParentTask).FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        // Must be a subtask
        if (task.ParentTaskId == null)
            return BadRequest(new { message = "TeamLead can only update subtasks, not projects." });

        // TeamLead must own the parent project
        var currentUserId = GetCurrentUserId();
        if (task.ParentTask?.AssigneeId != currentUserId)
            return StatusCode(403, new { message = "You can only update subtasks under projects assigned to you." });

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.Priority = request.Priority ?? task.Priority;
        task.Deadline = request.Deadline ?? task.Deadline;
        task.EstimatedHours = request.EstimatedHours ?? task.EstimatedHours;
        task.RequiredSkills = request.RequiredSkills ?? task.RequiredSkills;
        task.UpdatedDate = DateTime.UtcNow;

        // TeamLead can set SLA on subtasks
        if (request.SlaHours.HasValue)
            task.SlaHours = request.SlaHours.Value;

        await _db.SaveChangesAsync();

        task = await _db.Tasks
            .Include(t => t.Assignee).Include(t => t.Assigner).Include(t => t.SubTasks)
            .FirstAsync(t => t.TaskId == id);

        return Ok(MapToDto(task));
    }

    // ═══════════════════════════════════════════════════
    // PATCH /api/tasks/{id}/status — Employee only
    // ═══════════════════════════════════════════════════
    [Authorize(Roles = "Employee")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTaskStatusRequest request)
    {
        var task = await _db.Tasks
            .Include(t => t.SubTasks)
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        var currentUserId = GetCurrentUserId();

        // Employee can only update their own assigned task
        if (task.AssigneeId != currentUserId)
            return StatusCode(403, new { message = "You can only update status on tasks assigned to you." });

        // Employee allowed transitions only:
        //   Pending (0) → InProgress (2)
        //   InProgress (2) → Completed (3)
        var allowed = (task.Status == 0 && request.Status == 2)
                   || (task.Status == 2 && request.Status == 3);
        if (!allowed)
            return BadRequest(new { message = "Employees can only transition Pending→InProgress or InProgress→Completed." });

        // Guard: cannot complete a paused task
        if (request.Status == 3 && task.Status == 4)
            return BadRequest(new { message = "Cannot complete a paused task. Resume it first." });

        // Guard: subtask completion blocked if parent is paused
        if (request.Status == 3 && task.ParentTaskId != null && task.ParentTask?.Status == 4)
            return BadRequest(new { message = "Cannot complete subtask while parent project is paused." });

        // Guard: cannot complete project without all subtasks done
        if (request.Status == 3 && task.ParentTaskId == null)
        {
            if (!task.SubTasks.Any())
                return BadRequest(new { message = "Project must have at least one subtask before completion." });
            var incompleteCount = task.SubTasks.Count(st => st.Status != 3);
            if (incompleteCount > 0)
                return BadRequest(new { message = $"Cannot complete project. {incompleteCount} subtask(s) are still incomplete." });
        }

        var oldStatus = task.Status;
        task.Status = request.Status;
        task.UpdatedDate = DateTime.UtcNow;

        // Set StartedAt when moving to InProgress
        if (request.Status == 2 && task.StartedAt == null)
            task.StartedAt = DateTime.UtcNow;

        if (task.Status == 3)
        {
            task.CompletedDate = DateTime.UtcNow;

            // Record skill usage for the completed task
            if (!string.IsNullOrWhiteSpace(task.RequiredSkills) && task.AssigneeId.HasValue)
            {
                var skills = task.RequiredSkills
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var skill in skills)
                {
                    _db.SkillUsages.Add(new SkillUsage
                    {
                        EmployeeId = task.AssigneeId.Value,
                        Skill = skill.Trim(),
                        TaskId = task.TaskId,
                        CompletedSuccessfully = true,
                        RecordedAt = DateTime.UtcNow
                    });
                }
            }
        }

        // SLA breach check
        if (task.StartedAt.HasValue && task.SlaHours.HasValue && !task.SlaBreached)
        {
            var slaDeadline = task.StartedAt.Value.AddHours(task.SlaHours.Value);
            if (DateTime.UtcNow > slaDeadline)
            {
                task.SlaBreached = true;
                // Notify TeamLead (parent project assignee) and Manager (team manager)
                await CreateSlaBreachNotifications(task);
            }
        }

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = currentUserId,
            Action = request.Status == 3
                ? (task.ParentTaskId == null ? "project_completed" : "subtask_completed")
                : "status_changed",
            Details = $"Status: {oldStatus} → {request.Status}"
        });
        // Notify team lead when subtask is completed
        if (request.Status == 3 && task.ParentTaskId != null)
        {
            var parentTask = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == task.ParentTaskId);
            if (parentTask?.AssigneeId != null)
            {
                var employee = await _db.Users.FindAsync(currentUserId);
                var empName = employee != null ? $"{employee.FirstName} {employee.LastName}" : "Employee";
                Services.NotificationService.TaskCompleted(_db, parentTask.AssigneeId.Value, task.Title, task.TaskId, empName);
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Status updated." });
    }

    // ═══════════════════════════════════════════════════
    // PATCH /api/tasks/{id}/cancel — Admin governance override
    // ═══════════════════════════════════════════════════
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        if (task.Status == 3)
            return BadRequest(new { message = "Cannot cancel a completed task." });
        if (task.Status == 6)
            return BadRequest(new { message = "Task is already cancelled." });

        var actorId = GetCurrentUserId();
        var oldStatus = task.Status;

        task.Status = 6; // Cancelled
        task.UpdatedDate = DateTime.UtcNow;

        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = actorId,
            Action = "task_cancelled",
            Details = $"Previous status: {oldStatus}. Admin governance override."
        });

        if (task.AssigneeId.HasValue)
        {
            Services.NotificationService.Create(_db, task.AssigneeId.Value, "Task Cancelled",
                $"Your {(task.ParentTaskId == null ? "project" : "task")} \"{task.Title}\" has been cancelled.",
                "task_cancelled", task.TaskId);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Task cancelled." });
    }

    // Only Admin and Manager can delete tasks
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        // Block deleting parent if subtasks exist
        if (task.ParentTaskId == null && task.SubTasks.Any())
            return BadRequest(new { message = $"Cannot delete project with {task.SubTasks.Count} subtask(s). Delete subtasks first." });

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Task deleted." });
    }

    // ═══════════════════════════════════════════════════
    // PAUSE / RESUME — Role-specific governance
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/pause")]
    public async Task<IActionResult> Pause(int id, [FromBody] PauseTaskRequest? request)
    {
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        if (task.Status == 3)
            return BadRequest(new { message = "Cannot pause a completed task." });
        if (task.Status == 4)
            return BadRequest(new { message = "Task is already paused." });
        if (task.Status == 6)
            return BadRequest(new { message = "Cannot pause a cancelled task." });

        var actorId = GetCurrentUserId();
        var previousStatus = task.Status;

        // ── Governance: role-specific validation ──
        if (!User.IsInRole("Admin"))
        {
            if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
            {
                // TeamLead: subtasks only
                if (task.ParentTaskId == null)
                    return BadRequest(new { message = "TeamLead can only pause subtasks, not projects." });
                if (task.ParentTask?.AssigneeId != actorId)
                    return StatusCode(403, new { message = "You can only pause subtasks of projects assigned to you." });
            }
            else if (User.IsInRole("Manager"))
            {
                // Manager: must be the project creator
                var projectId = task.ParentTaskId ?? task.TaskId;
                var project = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == projectId);
                if (project?.AssignerId != actorId)
                    return StatusCode(403, new { message = "You can only pause tasks in projects you created." });
            }
        }
        // Admin bypasses all checks

        task.Status = 4; // Paused
        task.PausedAt = DateTime.UtcNow;
        task.PauseReason = request?.Reason;
        task.UpdatedDate = DateTime.UtcNow;

        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = actorId,
            Action = task.ParentTaskId == null ? "project_paused" : "subtask_paused",
            Details = $"Reason: {request?.Reason ?? "(none)"}. Previous status: {previousStatus}."
        });

        if (task.AssigneeId.HasValue)
        {
            var reasonText = string.IsNullOrWhiteSpace(request?.Reason) ? "" : $" Reason: {request.Reason}";
            Services.NotificationService.Create(_db, task.AssigneeId.Value, "Task Paused",
                $"Your {(task.ParentTaskId == null ? "project" : "task")} \"{task.Title}\" has been paused.{reasonText}",
                "task_paused", task.TaskId);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Task paused.", pausedAt = task.PausedAt, reason = task.PauseReason });
    }

    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/resume")]
    public async Task<IActionResult> Resume(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        if (task.Status != 4 || task.PausedAt == null)
            return BadRequest(new { message = "Task is not paused." });
        if (task.Status == 6)
            return BadRequest(new { message = "Cannot resume a cancelled task." });

        // Block subtask resume if parent is paused
        if (task.ParentTaskId != null && task.ParentTask?.Status == 4)
            return BadRequest(new { message = "Cannot resume subtask while parent project is paused. Resume the project first." });

        var actorId = GetCurrentUserId();

        // ── Governance: role-specific validation ──
        if (!User.IsInRole("Admin"))
        {
            if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
            {
                // TeamLead: subtasks only
                if (task.ParentTaskId == null)
                    return BadRequest(new { message = "TeamLead can only resume subtasks, not projects." });
                if (task.ParentTask?.AssigneeId != actorId)
                    return StatusCode(403, new { message = "You can only resume subtasks of projects assigned to you." });
            }
            else if (User.IsInRole("Manager"))
            {
                // Manager: must be the project creator
                var projectId = task.ParentTaskId ?? task.TaskId;
                var project = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == projectId);
                if (project?.AssignerId != actorId)
                    return StatusCode(403, new { message = "You can only resume tasks in projects you created." });
            }
        }
        // Admin bypasses all checks

        var oldDeadline = task.Deadline;
        var pauseDuration = DateTime.UtcNow - task.PausedAt.Value;
        if (task.ParentTaskId != null && task.Deadline.HasValue)
            task.Deadline = task.Deadline.Value + pauseDuration;

        var pauseReason = task.PauseReason;
        task.Status = 2; // InProgress
        task.PausedAt = null;
        task.PauseReason = null;
        task.UpdatedDate = DateTime.UtcNow;

        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = actorId,
            Action = task.ParentTaskId == null ? "project_resumed" : "subtask_resumed",
            Details = $"Old deadline: {oldDeadline?.ToString("dd MMM yyyy") ?? "none"}. " +
                      $"New deadline: {task.Deadline?.ToString("dd MMM yyyy") ?? "none"}. " +
                      $"Pause duration: {pauseDuration.TotalHours:F1}h. " +
                      $"Original pause reason: {pauseReason ?? "(none)"}"
        });

        if (task.AssigneeId.HasValue)
        {
            var deadlineNote = task.Deadline.HasValue ? $" Deadline extended to {task.Deadline.Value:dd MMM yyyy}." : "";
            Services.NotificationService.Create(_db, task.AssigneeId.Value, "Task Resumed",
                $"Your {(task.ParentTaskId == null ? "project" : "task")} \"{task.Title}\" has been resumed.{deadlineNote}",
                "task_resumed", task.TaskId);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Task resumed.", newDeadline = task.Deadline });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var tasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Where(t => t.AssigneeId == employeeId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(tasks.Select(MapToDto));
    }

    [HttpGet("manager/{managerId}")]
    public async Task<IActionResult> GetByManager(int managerId)
    {
        var tasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Where(t => t.AssignerId == managerId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(tasks.Select(MapToDto));
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{id}/subtasks
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpGet("{id}/subtasks")]
    public async Task<IActionResult> GetSubTasks(int id)
    {
        var parent = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == id);
        if (parent == null) return NotFound();

        // TeamLead can only view subtasks of projects assigned to them
        if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
        {
            var currentUserId = GetCurrentUserId();
            if (parent.AssigneeId != currentUserId)
                return StatusCode(403, new { message = "You can only view subtasks of projects assigned to you." });
        }

        var subtasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.WorkLogs)
            .Include(t => t.SubTasks)
            .Where(t => t.ParentTaskId == id)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(subtasks.Select(MapToDto));
    }

    private static TaskDto MapToDto(TaskItem t) => new()
    {
        Id = t.TaskId,
        Title = t.Title,
        Description = t.Description,
        AssigneeId = t.AssigneeId,
        AssigneeName = t.Assignee != null ? $"{t.Assignee.FirstName} {t.Assignee.LastName}" : null,
        AssignerId = t.AssignerId,
        AssignerName = t.Assigner != null ? $"{t.Assigner.FirstName} {t.Assigner.LastName}" : null,

        Priority = t.Priority,
        Status = t.Status,
        Deadline = t.Deadline,
        EstimatedHours = t.EstimatedHours,
        CreatedDate = t.CreatedDate,
        UpdatedDate = t.UpdatedDate,
        CompletedDate = t.CompletedDate,
        StartedAt = t.StartedAt,
        PausedAt = t.PausedAt,
        PauseReason = t.PauseReason,
        RequiredSkills = t.RequiredSkills,
        SlaHours = t.SlaHours,
        SlaBreached = t.SlaBreached,
        TotalLoggedHours = t.WorkLogs?.Sum(w => w.TotalHours) ?? 0,
        ParentTaskId = t.ParentTaskId,
        IsProject = t.ParentTaskId == null,
        SubTaskCount = t.SubTasks?.Count ?? 0,
        CompletedSubTaskCount = t.SubTasks?.Count(st => st.Status == 3) ?? 0,
        TeamName = t.Project?.Team?.TeamName
    };

    /// <summary>Notify TeamLead and Manager when SLA is breached</summary>
    private async System.Threading.Tasks.Task CreateSlaBreachNotifications(TaskItem task)
    {
        var notifyUserIds = new HashSet<int>();

        // Notify parent project TeamLead
        if (task.ParentTaskId != null)
        {
            var parent = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == task.ParentTaskId);
            if (parent?.AssigneeId != null)
                notifyUserIds.Add(parent.AssigneeId.Value);
            // Notify project creator (Manager)
            if (parent?.AssignerId != null)
                notifyUserIds.Add(parent.AssignerId.Value);
        }

        foreach (var uid in notifyUserIds)
        {
            Services.NotificationService.Create(_db, uid, "SLA Breached",
                $"SLA breached for task: {task.Title}",
                "sla_breached", task.TaskId);
        }
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{taskId}/activity — Activity Timeline
    // ═══════════════════════════════════════════════════
    [HttpGet("{taskId}/activity")]
    public async Task<IActionResult> GetActivity(int taskId)
    {
        var task = await _db.Tasks.FindAsync(taskId);
        if (task == null) return NotFound();

        var logs = await _db.TaskAuditLogs
            .Where(a => a.TaskId == taskId)
            .Include(a => a.PerformedBy)
            .OrderByDescending(a => a.CreatedDate) // newest first
            .Select(a => new
            {
                a.AuditId,
                a.Action,
                a.Details,
                performedBy = a.PerformedBy != null
                    ? a.PerformedBy.FirstName + " " + a.PerformedBy.LastName : "System",
                a.CreatedDate
            })
            .ToListAsync();

        return Ok(logs);
    }
    // ═══════════════════════════════════════════════════
    // PATCH /api/tasks/{id}/reassign — Reassign task to another employee
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/reassign")]
    public async Task<IActionResult> Reassign(int id, [FromBody] ReassignTaskRequest request)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null) return NotFound(new { message = "Task not found." });

        // Cannot reassign completed or cancelled tasks
        if (task.Status == 3)
            return BadRequest(new { message = "Completed tasks cannot be reassigned." });
        if (task.Status == 6)
            return BadRequest(new { message = "Cancelled tasks cannot be reassigned." });

        // Cannot reassign to the same person
        if (task.AssigneeId == request.NewAssigneeId)
            return BadRequest(new { message = "Task is already assigned to this user." });

        // Verify newAssignee exists and is an employee
        var newAssignee = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == request.NewAssigneeId && u.IsActive);

        if (newAssignee == null)
            return BadRequest(new { message = "New assignee not found or is inactive." });

        var isEmployee = newAssignee.UserRoles.Any(ur =>
            ur.Role.RoleName.Equals("Employee", StringComparison.OrdinalIgnoreCase));
        if (!isEmployee)
            return BadRequest(new { message = "New assignee must be an Employee." });

        var actorId = GetCurrentUserId();
        var actor = await _db.Users.FindAsync(actorId);
        var actorName = actor != null ? $"{actor.FirstName} {actor.LastName}" : "System";

        var oldAssigneeId = task.AssigneeId;
        var oldAssigneeName = task.Assignee != null
            ? $"{task.Assignee.FirstName} {task.Assignee.LastName}" : "Unassigned";
        var newAssigneeName = $"{newAssignee.FirstName} {newAssignee.LastName}";

        // Update task
        task.AssigneeId = request.NewAssigneeId;
        task.UpdatedDate = DateTime.UtcNow;

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = actorId,
            Action = "task_reassigned",
            Details = $"Reassigned from {oldAssigneeName} to {newAssigneeName}." +
                      (string.IsNullOrWhiteSpace(request.Reason) ? "" : $" Reason: {request.Reason}")
        });

        // Notify new assignee
        Services.NotificationService.Create(_db, request.NewAssigneeId, "Task Assigned",
            $"You have been assigned \"{task.Title}\" (reassigned from {oldAssigneeName} by {actorName}).",
            "task_assigned", task.TaskId);

        // Notify old assignee
        if (oldAssigneeId.HasValue && oldAssigneeId.Value != request.NewAssigneeId)
        {
            Services.NotificationService.Create(_db, oldAssigneeId.Value, "Task Reassigned",
                $"Your task \"{task.Title}\" has been reassigned to {newAssigneeName} by {actorName}.",
                "task_reassigned", task.TaskId);
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Task reassigned successfully.", newAssigneeName });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{id}/eligible-assignees
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpGet("{id}/eligible-assignees")]
    public async Task<IActionResult> GetEligibleAssignees(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        // Determine the project (parent task) to find eligible assignees
        var projectTaskId = task.ParentTaskId ?? task.TaskId;

        // Find the Project entity linked to this task
        var projectTask = task.ParentTaskId.HasValue ? task.ParentTask : task;
        var projectId = projectTask?.ProjectId;

        if (projectId.HasValue)
        {
            // Return only project members with Employee role
            var employeeRoleNames = new[] { "Employee" };
            var members = await _db.ProjectMembers
                .Where(pm => pm.ProjectId == projectId.Value)
                .Include(pm => pm.User)
                    .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(pm => pm.User.IsActive)
                .Where(pm => pm.User.UserRoles.Any(ur => employeeRoleNames.Contains(ur.Role.RoleName)))
                .Select(pm => new
                {
                    userId = pm.UserId,
                    name = pm.User.FirstName + " " + pm.User.LastName,
                    pm.User.Email,
                    role = pm.User.UserRoles.FirstOrDefault()!.Role.RoleName
                })
                .ToListAsync();
            return Ok(members);
        }

        // Fallback: if no project linked, return all active employees
        var employeeRoleIds = await _db.Roles
            .Where(r => r.RoleName == "Employee")
            .Select(r => r.RoleId)
            .ToListAsync();

        var allMembers = await _db.Users
            .Include(u => u.UserRoles)
            .Where(u => u.IsActive)
            .Where(u => u.UserRoles.Any(ur => employeeRoleIds.Contains(ur.RoleId)))
            .Select(u => new
            {
                userId = u.UserId,
                name = u.FirstName + " " + u.LastName,
                u.Email,
                role = u.UserRoles.FirstOrDefault()!.Role.RoleName
            })
            .ToListAsync();

        return Ok(allMembers);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
