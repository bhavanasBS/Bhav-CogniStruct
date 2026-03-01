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
        [FromQuery] string? priority,
        [FromQuery] int? teamId)
    {
        var query = _db.Tasks.AsQueryable();

        // If the user is an Employee, only show tasks assigned to them
        var isPrivileged = User.IsInRole("Admin") || User.IsInRole("Manager") || User.IsInRole("TeamLead");
        if (!isPrivileged)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
            {
                query = query.Where(t => t.AssigneeId == currentUserId);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));

        if (!string.IsNullOrWhiteSpace(status) && int.TryParse(status, out var s))
            query = query.Where(t => t.Status == s);

        if (!string.IsNullOrWhiteSpace(priority) && int.TryParse(priority, out var p))
            query = query.Where(t => t.Priority == p);

        if (teamId.HasValue)
            query = query.Where(t => t.TeamId == teamId.Value);

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
                TeamId = t.TeamId,
                TeamName = t.Team != null ? t.Team.TeamName : null,
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
                CompletedSubTaskCount = t.SubTasks.Count(st => st.Status == 3)
            }).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.Team)
            .Include(t => t.WorkLogs)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null) return NotFound();

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

            if (!request.TeamId.HasValue)
                return BadRequest(new { message = "Team is required." });

            var team = await _db.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.TeamId == request.TeamId.Value);
            if (team == null)
                return BadRequest(new { message = "Invalid team." });

            // Manager must own the team (unless Admin)
            if (User.IsInRole("Manager") && !User.IsInRole("Admin"))
            {
                if (team.ManagerId != currentUserId)
                    return StatusCode(403, new { message = "You can only create tasks in teams you manage." });
            }

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

            // Assignee must be a member of the team
            if (!team.Members.Any(m => m.UserId == request.AssigneeId.Value))
                return BadRequest(new { message = "Assignee (TeamLead) does not belong to the selected team." });
        }
        // ══════════════════════════════════════════════
        // B. TEAMLEAD PATH — Create SubTask
        // ══════════════════════════════════════════════
        else if (isTeamLead)
        {
            // TeamLead MUST specify a parent task
            if (!request.ParentTaskId.HasValue)
                return BadRequest(new { message = "TeamLead can only create subtasks. ParentTaskId is required." });

            var parent = await _db.Tasks
                .Include(t => t.Team).ThenInclude(tm => tm.Members)
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

            // Inherit team from parent
            request.TeamId = parent.TeamId;

            // Validate assignee
            if (!request.AssigneeId.HasValue)
                return BadRequest(new { message = "Assignee is required." });

            var assignee = await _db.Users
                .Include(u => u.AssignedTasks)
                .FirstOrDefaultAsync(u => u.UserId == request.AssigneeId.Value);
            if (assignee == null || !assignee.IsActive)
                return BadRequest(new { message = "Assignee does not exist or is inactive." });

            // Assignee must belong to parent's team
            if (parent.Team?.Members != null && !parent.Team.Members.Any(m => m.UserId == request.AssigneeId.Value))
                return BadRequest(new { message = "Assignee does not belong to the project's team." });

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
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            AssigneeId = request.AssigneeId,
            AssignerId = currentUserId,
            TeamId = request.TeamId,
            Priority = request.Priority,
            Status = 0, // Pending
            Deadline = request.Deadline,
            EstimatedHours = request.EstimatedHours,
            RequiredSkills = request.RequiredSkills,
            ParentTaskId = request.ParentTaskId,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Reload with includes
        task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.Team)
            .Include(t => t.SubTasks)
            .FirstAsync(t => t.TaskId == task.TaskId);

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = task.TaskId,
            PerformedByUserId = currentUserId,
            Action = task.ParentTaskId == null ? "project_created" : "subtask_created",
            Details = $"Title: {task.Title}. Assigned to UserId: {task.AssigneeId}. Team: {task.TeamId}."
        });

        // Create notification for assignee
        if (task.AssigneeId.HasValue)
        {
            var notifType = task.ParentTaskId == null ? "project_assigned" : "task_assigned";
            var notifMsg = task.ParentTaskId == null
                ? $"You have been assigned a new project: {task.Title}"
                : $"You have been assigned a new subtask: {task.Title}";

            _db.Notifications.Add(new Notification
            {
                UserId = task.AssigneeId.Value,
                Type = notifType,
                Message = notifMsg,
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            });
        }
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.TaskId }, MapToDto(task));
    }

    // Admin and Manager can update tasks
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.AssigneeId = request.AssigneeId ?? task.AssigneeId;
        task.TeamId = request.TeamId ?? task.TeamId;
        task.Priority = request.Priority ?? task.Priority;
        task.Status = request.Status ?? task.Status;
        task.Deadline = request.Deadline ?? task.Deadline;
        task.EstimatedHours = request.EstimatedHours ?? task.EstimatedHours;
        task.RequiredSkills = request.RequiredSkills ?? task.RequiredSkills;
        task.UpdatedDate = DateTime.UtcNow;

        if (task.Status == 3) // Completed
            task.CompletedDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        task = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.Team)
            .FirstAsync(t => t.TaskId == id);

        return Ok(MapToDto(task));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTaskStatusRequest request)
    {
        var task = await _db.Tasks
            .Include(t => t.SubTasks)
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        var currentUserId = GetCurrentUserId();
        var oldStatus = task.Status;

        // Guard: cannot complete a paused task — must resume first
        if (request.Status == 3 && task.Status == 4)
            return BadRequest(new { message = "Cannot complete a paused task. Resume it first." });

        // ── SUBTASK completion: block if parent is paused ──
        if (request.Status == 3 && task.ParentTaskId != null && task.ParentTask?.Status == 4)
            return BadRequest(new { message = "Cannot complete subtask while parent project is paused." });

        // ── PROJECT completion governance ──
        if (request.Status == 3 && task.ParentTaskId == null)
        {
            if (!task.SubTasks.Any())
                return BadRequest(new { message = "Project must have at least one subtask before completion." });

            var incompleteCount = task.SubTasks.Count(st => st.Status != 3);
            if (incompleteCount > 0)
                return BadRequest(new { message = $"Cannot complete project. {incompleteCount} subtask(s) are still incomplete." });

            // TeamLead: must own project
            if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
            {
                if (task.AssigneeId != currentUserId)
                    return StatusCode(403, new { message = "You can only complete projects assigned to you." });
            }
            // Manager: must own the team (override)
            else if (User.IsInRole("Manager") && !User.IsInRole("Admin"))
            {
                var team = await _db.Teams.FirstOrDefaultAsync(t => t.TeamId == task.TeamId);
                if (team?.ManagerId != currentUserId)
                    return StatusCode(403, new { message = "You can only complete projects in teams you manage." });
            }
        }

        task.Status = request.Status;
        task.UpdatedDate = DateTime.UtcNow;

        if (task.Status == 3)
            task.CompletedDate = DateTime.UtcNow;

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

        await _db.SaveChangesAsync();
        return Ok(new { message = "Status updated." });
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
    // PAUSE / RESUME — Manager and TeamLead only
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Manager,TeamLead,Team Lead")]
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

        var actorId = GetCurrentUserId();
        var previousStatus = task.Status;

        // ── Ownership validation ──
        if (task.ParentTaskId != null)
        {
            // Subtask pause: TeamLead must own the parent, or Manager override
            if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
            {
                if (task.ParentTask?.AssigneeId != actorId)
                    return StatusCode(403, new { message = "You can only pause subtasks of projects assigned to you." });
            }
        }
        else
        {
            // Project pause: TeamLead must be assignee, or Manager override
            if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
            {
                if (task.AssigneeId != actorId)
                    return StatusCode(403, new { message = "You can only pause projects assigned to you." });
            }
        }

        task.Status = 4; // Paused
        task.PausedAt = DateTime.UtcNow;
        task.PauseReason = request?.Reason;
        task.UpdatedDate = DateTime.UtcNow;

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = id,
            PerformedByUserId = actorId,
            Action = task.ParentTaskId == null ? "project_paused" : "subtask_paused",
            Details = $"Reason: {request?.Reason ?? "(none)"}. Previous status: {previousStatus}."
        });

        await _db.SaveChangesAsync();

        // Notify assignee
        if (task.AssigneeId.HasValue)
        {
            var reasonText = string.IsNullOrWhiteSpace(request?.Reason) ? "" : $" Reason: {request.Reason}";
            _db.Notifications.Add(new Notification
            {
                UserId = task.AssigneeId.Value,
                Type = "task_paused",
                Message = $"Your {(task.ParentTaskId == null ? "project" : "task")} \"{task.Title}\" has been paused.{reasonText}",
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Task paused.", pausedAt = task.PausedAt, reason = task.PauseReason });
    }

    [Authorize(Roles = "Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/resume")]
    public async Task<IActionResult> Resume(int id)
    {
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return NotFound();

        if (task.Status != 4 || task.PausedAt == null)
            return BadRequest(new { message = "Task is not paused." });

        // Block subtask resume if parent is paused
        if (task.ParentTaskId != null && task.ParentTask?.Status == 4)
            return BadRequest(new { message = "Cannot resume subtask while parent project is paused. Resume the project first." });

        var actorId = GetCurrentUserId();
        var oldDeadline = task.Deadline;

        // Extend deadline by pause duration — SUBTASK ONLY (not project)
        var pauseDuration = DateTime.UtcNow - task.PausedAt.Value;
        if (task.ParentTaskId != null && task.Deadline.HasValue)
            task.Deadline = task.Deadline.Value + pauseDuration;
        // Project deadline is NOT auto-extended per spec

        var pauseReason = task.PauseReason; // capture before clearing
        task.Status = 2; // InProgress
        task.PausedAt = null;
        task.PauseReason = null;
        task.UpdatedDate = DateTime.UtcNow;

        // Audit log
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

        await _db.SaveChangesAsync();

        // Notify assignee
        if (task.AssigneeId.HasValue)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = task.AssigneeId.Value,
                Type = "task_resumed",
                Message = $"Your {(task.ParentTaskId == null ? "project" : "task")} \"{task.Title}\" has been resumed." +
                    (task.Deadline.HasValue ? $" Deadline extended to {task.Deadline.Value:dd MMM yyyy}." : ""),
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Task resumed.", newDeadline = task.Deadline });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var tasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.Team)
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
            .Include(t => t.Team)
            .Where(t => t.AssignerId == managerId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(tasks.Select(MapToDto));
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(int teamId)
    {
        var tasks = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assigner)
            .Include(t => t.Team)
            .Where(t => t.TeamId == teamId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();

        return Ok(tasks.Select(MapToDto));
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{id}/subtasks
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead")]
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
            .Include(t => t.Team)
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
        TeamId = t.TeamId,
        TeamName = t.Team?.TeamName,
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
        TotalLoggedHours = t.WorkLogs?.Sum(w => w.TotalHours) ?? 0,
        ParentTaskId = t.ParentTaskId,
        IsProject = t.ParentTaskId == null,
        SubTaskCount = t.SubTasks?.Count ?? 0,
        CompletedSubTaskCount = t.SubTasks?.Count(st => st.Status == 3) ?? 0
    };

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
