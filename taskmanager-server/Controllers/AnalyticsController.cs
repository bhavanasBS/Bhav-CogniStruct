using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin,Manager")]  // Admin, Manager can view analytics
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
        var tasks = await _db.Tasks.Where(t => t.Status != 6).ToListAsync(); // exclude Cancelled
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
        // Compare projects (parent tasks) instead of teams
        var projects = await _db.Tasks
            .Include(t => t.SubTasks)
            .Where(t => t.ParentTaskId == null)
            .ToListAsync();

        var comparison = projects.Select(p =>
        {
            var total = p.SubTasks.Count;
            var completed = p.SubTasks.Count(st => st.Status == 3);
            return new TeamComparisonDto
            {
                Name = p.Title,
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

    // ═══════════════════════════════════════════════════
    // GET /api/analytics/employee-productivity
    // ═══════════════════════════════════════════════════
    [HttpGet("employee-productivity")]
    public async Task<IActionResult> GetEmployeeProductivity()
    {
        var users = await _db.Users
            .Include(u => u.AssignedTasks).ThenInclude(t => t.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive)
            .ToListAsync();

        var results = new List<EmployeeProductivityDto>();

        foreach (var u in users)
        {
            // Exclude cancelled tasks
            var tasks = u.AssignedTasks.Where(t => t.Status != 6 && t.ParentTaskId != null).ToList();
            if (!tasks.Any()) continue;

            var assignedCount = tasks.Count;
            var completedTasks = tasks.Where(t => t.Status == 3).ToList();
            var completedCount = completedTasks.Count;

            // Productivity Score
            var productivityScore = assignedCount > 0
                ? Math.Round((double)completedCount / assignedCount * 100, 1) : 0;

            // Average Completion Time (hours)
            var avgTime = 0.0;
            if (completedTasks.Any())
            {
                var durations = completedTasks
                    .Where(t => t.CompletedDate.HasValue && t.StartedAt.HasValue)
                    .Select(t => (t.CompletedDate!.Value - t.StartedAt!.Value).TotalHours)
                    .ToList();
                avgTime = durations.Any() ? Math.Round(durations.Average(), 1) : 0;
            }

            // Overdue Rate
            var tasksWithDeadline = tasks.Where(t => t.Deadline.HasValue).ToList();
            var overdueCount = tasksWithDeadline.Count(t =>
                (t.CompletedDate.HasValue && t.CompletedDate > t.Deadline)
                || (!t.CompletedDate.HasValue && t.Status != 3 && DateTime.UtcNow > t.Deadline));
            var overdueRate = tasksWithDeadline.Any()
                ? Math.Round((double)overdueCount / tasksWithDeadline.Count * 100, 1) : 0;

            // Consistency Score
            var consistency = ComputeConsistency(u.UserId, completedTasks);

            results.Add(new EmployeeProductivityDto
            {
                EmployeeId = u.UserId,
                EmployeeName = $"{u.FirstName} {u.LastName}",
                CompletedTasks = completedCount,
                AverageCompletionTime = avgTime,
                OverdueRate = overdueRate,
                ProductivityScore = productivityScore,
                ConsistencyScore = consistency
            });
        }

        return Ok(results.OrderByDescending(r => r.ProductivityScore));
    }

    private double ComputeConsistency(int userId, List<TaskManager.API.Models.TaskItem> completedTasks)
    {
        if (completedTasks.Count < 3) return 70; // neutral default

        var tasksWithDeadline = completedTasks.Where(t => t.Deadline.HasValue).ToList();

        // Variance
        var variances = completedTasks
            .Where(t => t.EstimatedHours > 0 && t.WorkLogs != null)
            .Select(t =>
            {
                var actual = t.WorkLogs!.Sum(w => w.TotalHours);
                if (actual == 0) actual = t.EstimatedHours;
                return Math.Abs(actual - t.EstimatedHours) / t.EstimatedHours;
            }).ToList();
        var varianceScore = variances.Any()
            ? Math.Max(0, (1.0 - variances.Average()) * 40.0) : 30;

        // Adherence
        double adherenceScore;
        if (tasksWithDeadline.Any())
        {
            var onTime = tasksWithDeadline.Count(t => t.CompletedDate!.Value <= t.Deadline!.Value);
            adherenceScore = (double)onTime / tasksWithDeadline.Count * 40.0;
        }
        else adherenceScore = 30;

        // Overdue
        double overdueScore;
        if (tasksWithDeadline.Any())
        {
            var overdue = tasksWithDeadline.Count(t => t.CompletedDate!.Value > t.Deadline!.Value);
            overdueScore = (1.0 - (double)overdue / tasksWithDeadline.Count) * 20.0;
        }
        else overdueScore = 15;

        return Math.Clamp(Math.Round(varianceScore + adherenceScore + overdueScore, 1), 0, 100);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/analytics/team-performance/{teamId}
    // Manager dashboard — per-employee performance analytics
    // ═══════════════════════════════════════════════════

    [HttpGet("team-performance/{teamId}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetTeamPerformance(int teamId)
    {
        // Get all active employees
        var employees = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && u.UserRoles.Any(ur =>
                ur.Role.RoleName.Equals("Employee", StringComparison.OrdinalIgnoreCase)))
            .ToListAsync();

        var result = new List<object>();

        foreach (var user in employees)
        {
            var tasks = user.AssignedTasks.Where(t => t.Status != 6).ToList(); // exclude cancelled
            var completed = tasks.Where(t => t.Status == 3).ToList();

            // Average feedback rating
            var feedbacks = await _db.TaskFeedbacks
                .Where(f => f.EmployeeId == user.UserId)
                .Select(f => f.OverallRating)
                .ToListAsync();
            var avgFeedback = feedbacks.Any() ? Math.Round(feedbacks.Average(), 1) : 0;

            // Manager review score (latest)
            var latestReview = await _db.EmployeeReviews
                .Where(r => r.EmployeeId == user.UserId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (int?)r.PerformanceScore)
                .FirstOrDefaultAsync();

            // Productivity
            var productivity = tasks.Any()
                ? Math.Round((double)completed.Count / tasks.Count * 100, 1) : 0;

            // Avg completion time (hours)
            double avgCompletionTime = 0;
            var withStart = completed.Where(t => t.StartedAt.HasValue && t.CompletedDate.HasValue).ToList();
            if (withStart.Any())
                avgCompletionTime = Math.Round(withStart.Average(t => (t.CompletedDate!.Value - t.StartedAt!.Value).TotalHours), 1);

            // Overdue rate
            var withDeadline = completed.Where(t => t.Deadline.HasValue).ToList();
            double overdueRate = 0;
            if (withDeadline.Any())
            {
                var overdue = withDeadline.Count(t => t.CompletedDate!.Value > t.Deadline!.Value);
                overdueRate = Math.Round((double)overdue / withDeadline.Count * 100, 1);
            }

            result.Add(new
            {
                employeeId = user.UserId,
                employeeName = user.FirstName + " " + user.LastName,
                averageFeedbackRating = avgFeedback,
                managerReviewScore = latestReview ?? 0,
                productivityScore = productivity,
                averageCompletionTime = avgCompletionTime,
                overdueRate
            });
        }

        return Ok(result);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/analytics/top-performers
    // Top 5 employees this week by tasks completed + efficiency
    // ═══════════════════════════════════════════════════

    [HttpGet("top-performers")]
    public async Task<IActionResult> GetTopPerformers()
    {
        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var weekEnd = weekStart.AddDays(7);

        // Get all completed tasks this week with their assignees
        var completedThisWeek = await _db.Tasks
            .Where(t => t.Status == 3
                && t.CompletedDate != null
                && t.CompletedDate >= weekStart
                && t.CompletedDate < weekEnd
                && t.AssigneeId != null)
            .Include(t => t.Assignee)
            .ToListAsync();

        // Get work logs this week
        var workLogs = await _db.WorkLogs
            .Where(w => w.StartTime >= weekStart && w.StartTime < weekEnd)
            .ToListAsync();

        // Group by assignee
        var grouped = completedThisWeek
            .GroupBy(t => t.AssigneeId!.Value)
            .Select(g =>
            {
                var emp = g.First().Assignee!;
                var tasks = g.ToList();
                var tasksCompleted = tasks.Count;
                var totalEstimated = tasks.Sum(t => t.EstimatedHours);
                var hoursLogged = Math.Round(workLogs
                    .Where(w => w.UserId == g.Key)
                    .Sum(w => w.TotalHours), 1);
                var actualHours = hoursLogged > 0 ? hoursLogged : 1;
                var efficiency = totalEstimated > 0
                    ? Math.Round((totalEstimated / actualHours) * 100, 0)
                    : 0;

                return new
                {
                    employeeName = $"{emp.FirstName} {emp.LastName}",
                    tasksCompleted,
                    hoursLogged,
                    efficiency = Math.Min(efficiency, 100) // cap at 100
                };
            })
            .OrderByDescending(x => x.tasksCompleted)
            .ThenByDescending(x => x.efficiency)
            .Take(5)
            .ToList();

        return Ok(grouped);
    }
}
