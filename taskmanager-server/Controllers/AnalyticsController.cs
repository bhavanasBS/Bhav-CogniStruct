using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin,Manager,HR")]  // Admin, Manager, HR can view analytics
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("completion-rate")]
    public async Task<IActionResult> GetCompletionRate()
    {
        var tasks = await _db.Tasks.ToListAsync();
        var total = tasks.Count;
        var completed = tasks.Count(t => t.Status == 3);
        var rate = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0;

        // Daily breakdown for last 7 days
        var startDate = DateTime.UtcNow.Date.AddDays(-6);
        var dayNames = new[] { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        var daily = new List<DailyCompletionDto>();

        for (int i = 0; i < 7; i++)
        {
            var day = startDate.AddDays(i);
            var dayTasks = tasks.Where(t => t.UpdatedDate.Date == day).ToList();
            daily.Add(new DailyCompletionDto
            {
                Name = dayNames[(int)day.DayOfWeek],
                Completed = dayTasks.Count(t => t.Status == 3),
                InProgress = dayTasks.Count(t => t.Status == 2),
                Pending = dayTasks.Count(t => t.Status == 0 || t.Status == 1)
            });
        }

        return Ok(new CompletionRateDto
        {
            TotalTasks = total,
            CompletedTasks = completed,
            Rate = rate,
            Daily = daily
        });
    }

    [HttpGet("avg-completion-time")]
    public async Task<IActionResult> GetAvgCompletionTime()
    {
        var completedTasks = await _db.Tasks
            .Where(t => t.Status == 3 && t.CompletedDate.HasValue)
            .ToListAsync();

        if (!completedTasks.Any())
            return Ok(new AvgCompletionTimeDto { AverageHours = 0, AverageDays = 0 });

        var avgHours = completedTasks
            .Average(t => (t.CompletedDate!.Value - t.CreatedDate).TotalHours);

        return Ok(new AvgCompletionTimeDto
        {
            AverageHours = Math.Round(avgHours, 1),
            AverageDays = Math.Round(avgHours / 24, 1)
        });
    }

    [HttpGet("productivity-scores")]
    public async Task<IActionResult> GetProductivityScores()
    {
        var users = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.WorkLogs)
            .Where(u => u.IsActive)
            .ToListAsync();

        var scores = users
            .Where(u => u.AssignedTasks.Any())
            .Select(u =>
            {
                var tasks = u.AssignedTasks.Count;
                var completed = u.AssignedTasks.Count(t => t.Status == 3);
                var hours = u.WorkLogs.Sum(w => w.TotalHours);
                var efficiency = tasks > 0 ? Math.Round((double)completed / tasks * 100, 1) : 0;

                return new ProductivityScoreDto
                {
                    UserId = u.UserId,
                    Name = $"{u.FirstName} {u.LastName}",
                    Tasks = tasks,
                    Hours = Math.Round(hours, 1),
                    Efficiency = efficiency,
                    Streak = completed // Simplified streak
                };
            })
            .OrderByDescending(s => s.Efficiency)
            .ToList();

        return Ok(scores);
    }

    [HttpGet("team-comparison")]
    public async Task<IActionResult> GetTeamComparison()
    {
        var teams = await _db.Teams
            .Include(t => t.Tasks)
            .Include(t => t.Members)
            .Where(t => t.IsActive)
            .ToListAsync();

        var comparison = teams.Select(t =>
        {
            var total = t.Tasks.Count;
            var completed = t.Tasks.Count(tk => tk.Status == 3);
            return new TeamComparisonDto
            {
                Name = t.TeamName,
                Tasks = total,
                Efficiency = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0
            };
        }).OrderByDescending(c => c.Efficiency).ToList();

        return Ok(comparison);
    }

    [HttpGet("weekly-productivity/{userId}")]
    public async Task<IActionResult> GetWeeklyProductivity(int userId)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-6);
        var dayNames = new[] { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };

        var tasks = await _db.Tasks
            .Where(t => t.AssigneeId == userId && t.UpdatedDate >= startDate)
            .ToListAsync();

        var logs = await _db.WorkLogs
            .Where(w => w.UserId == userId && w.StartTime >= startDate)
            .ToListAsync();

        var weekly = new List<WeeklyProductivityDto>();
        for (int i = 0; i < 7; i++)
        {
            var day = startDate.AddDays(i);
            weekly.Add(new WeeklyProductivityDto
            {
                Name = dayNames[(int)day.DayOfWeek],
                Tasks = tasks.Count(t => t.UpdatedDate.Date == day),
                Hours = Math.Round(logs.Where(l => l.StartTime.Date == day).Sum(l => l.TotalHours), 1)
            });
        }

        return Ok(weekly);
    }

    [HttpGet("task-distribution")]
    public async Task<IActionResult> GetTaskDistribution()
    {
        var tasks = await _db.Tasks.ToListAsync();

        var statusNames = new Dictionary<int, string>
        {
            { 0, "Pending" }, { 1, "Assigned" }, { 2, "In Progress" }, { 3, "Completed" }, { 4, "Paused" }
        };

        var distribution = tasks
            .GroupBy(t => t.Status)
            .Select(g => new TaskDistributionDto
            {
                Name = statusNames.GetValueOrDefault(g.Key, "Unknown"),
                Value = g.Count()
            })
            .OrderBy(d => d.Name)
            .ToList();

        return Ok(distribution);
    }

    [HttpGet("activity-stream")]
    public async Task<IActionResult> GetActivityStream()
    {
        var now = DateTime.UtcNow;
        var start = now.AddHours(-12);

        var tasks = await _db.Tasks
            .Where(t => t.CreatedDate >= start || t.UpdatedDate >= start)
            .ToListAsync();

        var logs = await _db.WorkLogs
            .Where(w => w.CreatedDate >= start)
            .ToListAsync();

        var hours = Enumerable.Range(0, 12).Select(i =>
        {
            var hour = start.AddHours(i);
            var nextHour = hour.AddHours(1);
            return new ActivityStreamDto
            {
                Time = hour.ToString("HH:mm"),
                TaskCreated = tasks.Count(t => t.CreatedDate >= hour && t.CreatedDate < nextHour),
                TaskCompleted = tasks.Count(t => t.Status == 3 && t.UpdatedDate >= hour && t.UpdatedDate < nextHour),
                LogsAdded = logs.Count(l => l.CreatedDate >= hour && l.CreatedDate < nextHour)
            };
        }).ToList();

        return Ok(hours);
    }

    // ═══════════════════════════════════════════════════
    // CONSISTENCY SCORE — Dynamic computation (no DB storage)
    // ═══════════════════════════════════════════════════

    [HttpGet("consistency/{employeeId}")]
    public async Task<IActionResult> GetConsistency(int employeeId)
    {
        return Ok(await ComputeConsistencyScore(employeeId));
    }

    internal async Task<ConsistencyScoreDto> ComputeConsistencyScore(int employeeId)
    {
        var cutoff = DateTime.UtcNow.AddDays(-30);

        var completedTasks = await _db.Tasks
            .Include(t => t.WorkLogs)
            .Where(t => t.AssigneeId == employeeId
                     && t.Status == 3
                     && t.ParentTaskId != null // Only subtasks count
                     && t.CompletedDate.HasValue
                     && t.CompletedDate >= cutoff)
            .ToListAsync();

        var count = completedTasks.Count;

        // Edge case: fewer than 3 completed tasks → default 70
        if (count < 3)
        {
            return new ConsistencyScoreDto
            {
                UserId = employeeId,
                ConsistencyRaw = 70,
                VarianceScore = 28,
                AdherenceScore = 28,
                OverdueScore = 14,
                CompletedTasksCount = count
            };
        }

        // A. Delivery Variance Score (max 40)
        var variances = completedTasks
            .Where(t => t.EstimatedHours > 0)
            .Select(t =>
            {
                var actualHours = t.WorkLogs.Where(w => w.UserId == employeeId).Sum(w => w.TotalHours);
                if (actualHours <= 0) actualHours = t.EstimatedHours; // fallback
                return Math.Abs(actualHours - t.EstimatedHours) / t.EstimatedHours;
            })
            .ToList();

        var avgVariance = variances.Any() ? variances.Average() : 0;
        var varianceScore = Math.Clamp((1.0 - avgVariance) * 40.0, 0, 40);

        // B. Deadline Adherence Score (max 40)
        var tasksWithDeadline = completedTasks.Where(t => t.Deadline.HasValue).ToList();
        double adherenceScore;
        if (tasksWithDeadline.Any())
        {
            var onTime = tasksWithDeadline.Count(t => t.CompletedDate!.Value <= t.Deadline!.Value);
            adherenceScore = ((double)onTime / tasksWithDeadline.Count) * 40.0;
        }
        else
        {
            adherenceScore = 30; // neutral if no deadlines set
        }

        // C. Overdue Stability Score (max 20)
        double overdueScore;
        if (tasksWithDeadline.Any())
        {
            var overdue = tasksWithDeadline.Count(t => t.CompletedDate!.Value > t.Deadline!.Value);
            overdueScore = (1.0 - (double)overdue / tasksWithDeadline.Count) * 20.0;
        }
        else
        {
            overdueScore = 15; // neutral
        }

        var raw = Math.Clamp(Math.Round(varianceScore + adherenceScore + overdueScore, 1), 0, 100);

        return new ConsistencyScoreDto
        {
            UserId = employeeId,
            ConsistencyRaw = raw,
            VarianceScore = Math.Round(varianceScore, 1),
            AdherenceScore = Math.Round(adherenceScore, 1),
            OverdueScore = Math.Round(overdueScore, 1),
            CompletedTasksCount = count
        };
    }
}
