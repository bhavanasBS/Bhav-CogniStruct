using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/employee")]
[Authorize]
public class EmployeeProgressController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmployeeProgressController(AppDbContext db) => _db = db;

    // GET /api/employee/progress
    [HttpGet("progress")]
    public async Task<IActionResult> GetMyProgress()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        // All tasks assigned to this employee
        var tasks = await _db.Tasks
            .Where(t => t.AssigneeId == userId)
            .ToListAsync();

        var assignedTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == 3); // Completed
        var overdueTasks = tasks.Count(t =>
            t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3 && t.Status != 5);
        var onTimeCompletedTasks = tasks.Count(t =>
            t.Status == 3 && t.Deadline.HasValue && t.CompletedDate.HasValue && t.CompletedDate.Value <= t.Deadline.Value);

        // On-time rate
        var onTimeRate = completedTasks > 0
            ? Math.Round((double)onTimeCompletedTasks / completedTasks, 4)
            : 0;

        // Completion rate
        var completionRate = assignedTasks > 0
            ? Math.Round((double)completedTasks / assignedTasks, 4)
            : 0;

        // Activity rate from time logs
        var workLogs = await _db.WorkLogs
            .Where(w => w.UserId == userId)
            .ToListAsync();

        var daysActive = workLogs.Select(w => w.StartTime.Date).Distinct().Count();
        // Working days = roughly last 30 days × 5/7
        var workingDays = Math.Max(1, (int)(30 * 5.0 / 7.0)); // ~21 working days
        var activityRate = Math.Round(Math.Min(1.0, (double)daysActive / workingDays), 4);

        // Average feedback score (from TaskFeedback OverallRating, scale 1-5)
        var feedbacks = await _db.TaskFeedbacks
            .Where(f => f.Task.AssigneeId == userId)
            .ToListAsync();
        var avgFeedback = feedbacks.Count > 0
            ? Math.Round(feedbacks.Average(f => f.OverallRating), 2)
            : 0;
        var feedbackScore = avgFeedback / 5.0; // normalize to 0-1

        // Consistency Score
        var consistencyScore = Math.Round(
            (onTimeRate * 0.35 +
             completionRate * 0.35 +
             activityRate * 0.15 +
             feedbackScore * 0.15) * 100, 1);
        consistencyScore = Math.Min(100, Math.Max(0, consistencyScore));

        // Task completion monthly trend (last 6 months)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var completedByMonth = tasks
            .Where(t => t.Status == 3 && t.CompletedDate.HasValue && t.CompletedDate.Value >= sixMonthsAgo)
            .GroupBy(t => new { t.CompletedDate!.Value.Year, t.CompletedDate.Value.Month })
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                count = g.Count()
            })
            .OrderBy(g => g.month)
            .ToList();

        // Hours logged monthly trend (last 6 months)
        var hoursByMonth = workLogs
            .Where(w => w.StartTime >= sixMonthsAgo)
            .GroupBy(w => new { w.StartTime.Year, w.StartTime.Month })
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                hours = Math.Round(g.Sum(w => w.TotalHours), 1)
            })
            .OrderBy(g => g.month)
            .ToList();

        return Ok(new
        {
            assignedTasks,
            completedTasks,
            overdueTasks,
            onTimeCompletedTasks,
            onTimeRate = Math.Round(onTimeRate * 100, 1),
            completionRate = Math.Round(completionRate * 100, 1),
            activityRate = Math.Round(activityRate * 100, 1),
            daysActive,
            workingDays,
            avgFeedback,
            feedbackCount = feedbacks.Count,
            consistencyScore,
            completionTrend = completedByMonth,
            hoursTrend = hoursByMonth
        });
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
