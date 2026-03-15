using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/worklogs")]
[Authorize]
public class WorkLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkLogRequest request)
    {
        // Block work logs on paused tasks
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == request.TaskId);
        if (task != null && task.Status == 4)
            return BadRequest(new { message = "Cannot log work on a paused task. Resume it first." });
        // Block work logs if parent project is paused
        if (task?.ParentTaskId != null && task.ParentTask?.Status == 4)
            return BadRequest(new { message = "Cannot log work while parent project is paused." });

        var workLog = new WorkLog
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TotalHours = request.TotalHours > 0
                ? request.TotalHours
                : (request.EndTime.HasValue ? (request.EndTime.Value - request.StartTime).TotalHours : 0),
            Description = request.Description ?? string.Empty,
            CreatedDate = DateTime.UtcNow
        };

        _db.WorkLogs.Add(workLog);
        await _db.SaveChangesAsync();

        workLog = await _db.WorkLogs
            .Include(w => w.Task)
            .Include(w => w.User)
            .FirstAsync(w => w.WorkLogId == workLog.WorkLogId);

        return Ok(MapToDto(workLog));
    }

    [HttpGet("task/{taskId}")]
    public async Task<IActionResult> GetByTask(int taskId)
    {
        var logs = await _db.WorkLogs
            .Include(w => w.Task)
            .Include(w => w.User)
            .Where(w => w.TaskId == taskId)
            .OrderByDescending(w => w.StartTime)
            .ToListAsync();

        return Ok(logs.Select(MapToDto));
    }

    [HttpGet("employee/{userId}")]
    public async Task<IActionResult> GetByEmployee(int userId)
    {
        var logs = await _db.WorkLogs
            .Include(w => w.Task)
            .Include(w => w.User)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.StartTime)
            .ToListAsync();

        return Ok(logs.Select(MapToDto));
    }

    // ─── Team Work Logs (for Manager + TeamLead view) ─────────────
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    [HttpGet("team/{userId}")]
    public async Task<IActionResult> GetByTeam(int userId)
    {
        // Get direct reports (employees managed by this user)
        var directReportIds = await _db.Users
            .Where(u => u.ManagerId == userId && u.IsActive)
            .Select(u => u.UserId)
            .ToListAsync();

        // Also get subtask assignees from projects created by or assigned to this user
        var projectSubtaskAssigneeIds = await _db.Tasks
            .Where(t => t.ParentTaskId == null && (t.AssignerId == userId || t.AssigneeId == userId))
            .SelectMany(t => t.SubTasks)
            .Where(st => st.AssigneeId.HasValue)
            .Select(st => st.AssigneeId!.Value)
            .Distinct()
            .ToListAsync();

        // Combine all member IDs
        var allMemberIds = directReportIds.Union(projectSubtaskAssigneeIds).Distinct().ToList();

        // Include the user's own logs too
        if (!allMemberIds.Contains(userId))
            allMemberIds.Add(userId);

        var logs = await _db.WorkLogs
            .Include(w => w.Task)
            .Include(w => w.User)
            .Where(w => allMemberIds.Contains(w.UserId))
            .OrderByDescending(w => w.StartTime)
            .Take(100)
            .ToListAsync();

        return Ok(logs.Select(MapToDto));
    }

    [HttpGet("employee/{userId}/summary")]
    public async Task<IActionResult> GetEmployeeSummary(int userId)
    {
        var logs = await _db.WorkLogs
            .Where(w => w.UserId == userId)
            .ToListAsync();

        var totalHours = logs.Sum(l => l.TotalHours);
        var totalDays = logs.Select(l => l.StartTime.Date).Distinct().Count();
        var avgPerDay = totalDays > 0 ? totalHours / totalDays : 0;

        var dailyBreakdown = logs
            .GroupBy(l => l.StartTime.Date)
            .OrderByDescending(g => g.Key)
            .Take(30)
            .Select(g => new DailySummary
            {
                Date = g.Key,
                Hours = Math.Round(g.Sum(l => l.TotalHours), 2),
                Entries = g.Count()
            })
            .ToList();

        return Ok(new WorkLogSummaryDto
        {
            TotalHours = Math.Round(totalHours, 2),
            TotalEntries = logs.Count,
            AveragePerDay = Math.Round(avgPerDay, 2),
            DailyBreakdown = dailyBreakdown
        });
    }

    [HttpGet("employee/{userId}/weekly")]
    public async Task<IActionResult> GetWeeklyLogs(int userId)
    {
        var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(7);

        var logs = await _db.WorkLogs
            .Include(w => w.Task)
            .Where(w => w.UserId == userId && w.StartTime >= startOfWeek && w.StartTime < endOfWeek)
            .OrderBy(w => w.StartTime)
            .ToListAsync();

        var dayNames = new[] { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        var weekly = new List<WeeklyWorkLogDto>();

        for (int i = 0; i < 7; i++)
        {
            var day = startOfWeek.AddDays(i);
            var dayLogs = logs.Where(l => l.StartTime.Date == day).ToList();
            weekly.Add(new WeeklyWorkLogDto
            {
                Day = dayNames[i],
                Date = day,
                Hours = Math.Round(dayLogs.Sum(l => l.TotalHours), 2),
                Tasks = dayLogs.Select(l => l.TaskId).Distinct().Count()
            });
        }

        return Ok(weekly);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkLogRequest request)
    {
        var log = await _db.WorkLogs.FindAsync(id);
        if (log == null) return NotFound();

        log.StartTime = request.StartTime ?? log.StartTime;
        log.EndTime = request.EndTime ?? log.EndTime;
        log.TotalHours = request.TotalHours ?? log.TotalHours;
        log.Description = request.Description ?? log.Description;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Work log updated." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _db.WorkLogs.FindAsync(id);
        if (log == null) return NotFound();

        _db.WorkLogs.Remove(log);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Work log deleted." });
    }

    private static WorkLogDto MapToDto(WorkLog w) => new()
    {
        Id = w.WorkLogId,
        TaskId = w.TaskId,
        TaskTitle = w.Task?.Title ?? string.Empty,
        UserId = w.UserId,
        UserName = w.User != null ? $"{w.User.FirstName} {w.User.LastName}" : string.Empty,
        StartTime = w.StartTime,
        EndTime = w.EndTime,
        TotalHours = Math.Round(w.TotalHours, 2),
        Description = w.Description,
        CreatedDate = w.CreatedDate
    };
}
