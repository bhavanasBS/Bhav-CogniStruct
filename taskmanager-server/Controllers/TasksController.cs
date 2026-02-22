using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

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
                TotalLoggedHours = t.WorkLogs != null ? t.WorkLogs.Sum(w => w.TotalHours) : 0
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
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null) return NotFound();

        var dto = MapToDto(task);
        return Ok(dto);
    }

    // Admin, Manager, TeamLead can create tasks
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            AssigneeId = request.AssigneeId,
            AssignerId = request.AssignerId,
            TeamId = request.TeamId,
            Priority = request.Priority,
            Status = 0, // Pending
            Deadline = request.Deadline,
            EstimatedHours = request.EstimatedHours,
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
            .FirstAsync(t => t.TaskId == task.TaskId);

        // Create notification for assignee
        if (task.AssigneeId.HasValue)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = task.AssigneeId.Value,
                Type = "task_assigned",
                Message = $"You have been assigned a new task: {task.Title}",
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = task.TaskId }, MapToDto(task));
    }

    // Admin, Manager, TeamLead can update tasks
    [Authorize(Roles = "Admin,Manager,TeamLead")]
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
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        task.Status = request.Status;
        task.UpdatedDate = DateTime.UtcNow;

        if (task.Status == 3)
            task.CompletedDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Status updated." });
    }

    // Only Admin and Manager can delete tasks
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Task deleted." });
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
        TotalLoggedHours = t.WorkLogs?.Sum(w => w.TotalHours) ?? 0
    };
}
