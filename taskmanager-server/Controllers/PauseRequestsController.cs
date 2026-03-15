using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/pause-requests")]
[Authorize]
public class PauseRequestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PauseRequestsController(AppDbContext db)
    {
        _db = db;
    }

    // ─── POST /api/pause-requests/request ─────────────
    // Employee requests a pause for their assigned task
    [Authorize(Roles = "Employee")]
    [HttpPost("request")]
    public async Task<IActionResult> CreateRequest([FromBody] PauseRequestDto dto)
    {
        var currentUserId = GetCurrentUserId();

        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == dto.TaskId);
        if (task == null) return NotFound(new { message = "Task not found." });

        // Must be assignee
        if (task.AssigneeId != currentUserId)
            return StatusCode(403, new { message = "You can only request pause for tasks assigned to you." });

        // Task not completed or already paused
        if (task.Status == 3)
            return BadRequest(new { message = "Cannot request pause for a completed task." });
        if (task.Status == 4)
            return BadRequest(new { message = "Task is already paused." });

        // No existing pending request
        var existingPending = await _db.PauseRequests
            .AnyAsync(p => p.TaskId == dto.TaskId && p.Status == 0);
        if (existingPending)
            return BadRequest(new { message = "A pending pause request already exists for this task." });

        var pauseRequest = new PauseRequest
        {
            TaskId = dto.TaskId,
            EmployeeId = currentUserId,
            RequestedByUserId = currentUserId,
            Reason = dto.Reason,
            Status = 0, // Pending
            IsSystemGenerated = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.PauseRequests.Add(pauseRequest);

        // Notify TeamLead (project owner)
        if (task.ParentTaskId.HasValue)
        {
            var parentTask = task.ParentTask ?? await _db.Tasks.FindAsync(task.ParentTaskId.Value);
            if (parentTask?.AssigneeId != null)
            {
                var employee = await _db.Users.FindAsync(currentUserId);
                _db.Notifications.Add(new Notification
                {
                    UserId = parentTask.AssigneeId.Value,
                    Title = "Pause Request",
                    Type = "pause_request",
                    Message = $"{employee?.FirstName} {employee?.LastName} requested pause for task \"{task.Title}\"",
                    IsRead = false,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Pause request submitted. Awaiting TeamLead approval." });
    }

    // ─── GET /api/pause-requests/pending ────────────
    // TeamLead sees pause requests for tasks under their projects
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");
        var isManager = User.IsInRole("Manager");

        var query = _db.PauseRequests
            .Include(p => p.Task)
            .Include(p => p.Employee)
            .Include(p => p.RequestedBy)
            .Where(p => p.Status == 0); // Pending only

        if (!isAdmin && !isManager)
        {
            // TeamLead: only requests for tasks under projects assigned to them
            var myProjectIds = await _db.Tasks
                .Where(t => t.AssigneeId == currentUserId && t.ParentTaskId == null)
                .Select(t => t.TaskId)
                .ToListAsync();

            query = query.Where(p => p.Task.ParentTaskId != null &&
                                     myProjectIds.Contains(p.Task.ParentTaskId.Value));
        }

        var requests = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.TaskId,
                taskTitle = p.Task.Title,
                employeeId = p.EmployeeId,
                employeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                requestedByName = p.RequestedBy.FirstName + " " + p.RequestedBy.LastName,
                p.Reason,
                p.Status,
                p.IsSystemGenerated,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // ─── GET /api/pause-requests/all ────────────────
    // All requests (pending + resolved) for audit
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");
        var isManager = User.IsInRole("Manager");

        var query = _db.PauseRequests
            .Include(p => p.Task)
            .Include(p => p.Employee)
            .Include(p => p.RequestedBy)
            .Include(p => p.ApprovedBy)
            .AsQueryable();

        if (!isAdmin && !isManager)
        {
            var myProjectIds = await _db.Tasks
                .Where(t => t.AssigneeId == currentUserId && t.ParentTaskId == null)
                .Select(t => t.TaskId)
                .ToListAsync();

            query = query.Where(p => p.Task.ParentTaskId != null &&
                                     myProjectIds.Contains(p.Task.ParentTaskId.Value));
        }

        var requests = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .Select(p => new
            {
                p.Id,
                p.TaskId,
                taskTitle = p.Task.Title,
                employeeId = p.EmployeeId,
                employeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                requestedByName = p.RequestedBy.FirstName + " " + p.RequestedBy.LastName,
                p.Reason,
                p.Status,
                p.IsSystemGenerated,
                p.CreatedAt,
                approvedByName = p.ApprovedBy != null
                    ? p.ApprovedBy.FirstName + " " + p.ApprovedBy.LastName
                    : null,
                p.ApprovedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // ─── PATCH /api/pause-requests/{id}/approve ─────
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var request = await _db.PauseRequests
            .Include(p => p.Task)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (request == null) return NotFound();
        if (request.Status != 0)
            return BadRequest(new { message = "Request is already resolved." });

        var currentUserId = GetCurrentUserId();

        // Mark as approved
        request.Status = 1; // Approved
        request.ApprovedByUserId = currentUserId;
        request.ApprovedAt = DateTime.UtcNow;

        // Actually pause the task
        var task = request.Task;
        if (task.Status == 4)
            return BadRequest(new { message = "Task is already paused." });
        if (task.Status == 3)
            return BadRequest(new { message = "Cannot pause a completed task." });

        var previousStatus = task.Status;
        task.Status = 4; // Paused
        task.PausedAt = DateTime.UtcNow;
        task.PauseReason = request.Reason ?? "Workload escalation — approved pause";
        task.UpdatedDate = DateTime.UtcNow;

        // Audit log
        _db.TaskAuditLogs.Add(new TaskAuditLog
        {
            TaskId = task.TaskId,
            PerformedByUserId = currentUserId,
            Action = "subtask_paused_via_approval",
            Details = $"PauseRequest #{id} approved. Reason: {request.Reason ?? "(none)"}. Previous status: {previousStatus}."
        });

        // Notify assignee
        if (task.AssigneeId.HasValue)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = task.AssigneeId.Value,
                Title = "Task Paused",
                Type = "task_paused",
                Message = $"Your task \"{task.Title}\" has been paused due to workload escalation.",
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            });
        }

        // Notify Employee — approved
        _db.Notifications.Add(new Notification
        {
            UserId = request.EmployeeId,
            Title = "Pause Approved",
            Type = "pause_approved",
            Message = $"Your pause request for \"{task.Title}\" has been approved.",
            IsRead = false,
            CreatedDate = DateTime.UtcNow
        });

        // Notify Manager (project creator)
        if (task.ParentTaskId.HasValue)
        {
            var parentTask = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == task.ParentTaskId);
            if (parentTask?.AssignerId != null)
            {
                _db.Notifications.Add(new Notification
                {
                    UserId = parentTask.AssignerId.Value,
                    Title = "Pause Approved",
                    Type = "pause_approved",
                    Message = $"Pause request approved for task \"{task.Title}\".",
                    IsRead = false,
                    CreatedDate = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Pause request approved. Task has been paused." });
    }

    // ─── PATCH /api/pause-requests/{id}/reject ──────
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpPatch("{id}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var request = await _db.PauseRequests.FindAsync(id);
        if (request == null) return NotFound();
        if (request.Status != 0)
            return BadRequest(new { message = "Request is already resolved." });

        var currentUserId = GetCurrentUserId();

        request.Status = 2; // Rejected
        request.ApprovedByUserId = currentUserId;
        request.ApprovedAt = DateTime.UtcNow;

        // Notify Employee — rejected
        var rejTask = await _db.Tasks.FindAsync(request.TaskId);
        _db.Notifications.Add(new Notification
        {
            UserId = request.EmployeeId,
            Title = "Pause Rejected",
            Type = "pause_rejected",
            Message = $"Your pause request for \"{rejTask?.Title ?? $"Task #{request.TaskId}"}\" has been rejected.",
            IsRead = false,
            CreatedDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return Ok(new { message = "Pause request rejected." });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("UserId")
                       ?? User.FindFirst("sub");
        return int.Parse(userIdClaim!.Value);
    }
}
