using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/workload")]
[Authorize(Roles = "Admin,Manager,TeamLead")]
public class WorkloadController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkloadController(AppDbContext db)
    {
        _db = db;
    }

    // ═══════════════════════════════════════════════════
    // SHARED WORKLOAD ENGINE — Effort-Based (replaces old task-count model)
    // ═══════════════════════════════════════════════════

    private static readonly double[] PriorityMultipliers = { 1.0, 1.1, 1.2, 1.3 }; // Low, Medium, High, Critical

    private static WorkloadMemberDto ComputeWorkload(User user)
    {
        // Active tasks = subtasks only (exclude parent/project tasks, exclude completed)
        var activeTasks = user.AssignedTasks
            .Where(t => t.Status != 3 && t.Status != 5 && t.Status != 6 && t.ParentTaskId != null).ToList();

        // ── A. Effort Score (max 40%) ──────────────────
        var totalEstimatedEffort = activeTasks.Sum(t => t.EstimatedHours);
        const double maxEffortCapacity = 40.0;
        var effortScore = Math.Min(40.0, (totalEstimatedEffort / maxEffortCapacity) * 40.0);

        // ── B. Weekly Work Score (max 30%) ─────────────
        var weeklyHours = user.WorkLogs
            .Where(w => w.StartTime >= DateTime.UtcNow.AddDays(-7))
            .Sum(w => w.TotalHours);
        var weeklyScore = Math.Min(30.0, (weeklyHours / 40.0) * 30.0);

        // ── C. Priority Pressure (max 15%) ─────────────
        var priorityPressure = activeTasks.Sum(t =>
        {
            var idx = Math.Clamp(t.Priority, 0, 3);
            return t.EstimatedHours * (PriorityMultipliers[idx] - 1.0);
        });
        // Normalize: if max possible pressure = 40hrs * 0.3 (all Critical) = 12,
        // we scale so 12+ → 15%
        var priorityScore = Math.Min(15.0, (priorityPressure / 12.0) * 15.0);

        // ── D. Deadline Pressure (max 15%) ─────────────
        var now = DateTime.UtcNow;
        var deadlinePoints = 0.0;
        foreach (var t in activeTasks)
        {
            if (!t.Deadline.HasValue) continue;
            var daysLeft = (t.Deadline.Value - now).TotalDays;
            if (daysLeft <= 3) deadlinePoints += 5.0;
            else if (daysLeft <= 7) deadlinePoints += 2.5;
        }
        var deadlineScore = Math.Min(15.0, deadlinePoints);

        // ── Final Workload ─────────────────────────────
        var workload = (int)Math.Min(100, Math.Round(effortScore + weeklyScore + priorityScore + deadlineScore));

        var pausedCount = activeTasks.Count(t => t.Status == 4);

        // Total logged hours for active tasks
        var totalLoggedHours = user.WorkLogs
            .Where(w => w.StartTime >= DateTime.UtcNow.AddDays(-7))
            .Sum(w => w.TotalHours);

        // Remaining = estimated - logged (but never negative)
        var remaining = Math.Max(0, totalEstimatedEffort - totalLoggedHours);

        return new WorkloadMemberDto
        {
            Id = user.UserId,
            Name = $"{user.FirstName} {user.LastName}",
            Role = user.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
            // Keep old fields for backward compat
            Tasks = activeTasks.Count,
            MaxTasks = 10,
            Hours = Math.Round(weeklyHours, 1),
            MaxHours = 40.0,
            Workload = workload,
            // New task-based workload fields
            EstimatedWorkloadHours = Math.Round(totalEstimatedEffort, 1),
            LoggedHours = Math.Round(totalLoggedHours, 1),
            WeeklyCapacity = 40.0,
            RemainingHours = Math.Round(remaining, 1),
            // Breakdown
            EffortScore = Math.Round(effortScore, 1),
            WeeklyScore = Math.Round(weeklyScore, 1),
            PriorityScore = Math.Round(priorityScore, 1),
            DeadlineScore = Math.Round(deadlineScore, 1),
            PausedTasks = pausedCount
        };
    }

    // ═══════════════════════════════════════════════════
    // GET /api/workload/team/{teamId} — now uses project-based membership
    // ═══════════════════════════════════════════════════

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(int teamId)
    {
        // teamId parameter kept for backward compat; query all active employees
        var users = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && u.UserRoles.Any(ur => ur.Role.RoleName == "Employee"))
            .ToListAsync();

        var result = users
            .Select(u => ComputeWorkload(u))
            .OrderByDescending(w => w.Workload)
            .ToList();

        return Ok(result);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/workload/all — All employees across all teams
    // ═══════════════════════════════════════════════════

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive)
            .ToListAsync();

        var result = users
            .Select(u => ComputeWorkload(u))
            .OrderByDescending(w => w.Workload)
            .ToList();

        return Ok(result);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/workload/employee/{userId}
    // ═══════════════════════════════════════════════════

    [HttpGet("employee/{userId}")]
    public async Task<IActionResult> GetByEmployee(int userId)
    {
        var user = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return NotFound();

        return Ok(ComputeWorkload(user));
    }

    [HttpGet("recommend/{teamId}")]
    public async Task<IActionResult> Recommend(
        int teamId,
        [FromQuery] double hours = 8,
        [FromQuery] string? requiredSkills = null)
    {
        // Get all active employees
        var employees = await _db.Users
            .Include(u => u.AssignedTasks).ThenInclude(t => t.WorkLogs)
            .Include(u => u.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && u.UserRoles.Any(ur => ur.Role.RoleName == "Employee"))
            .ToListAsync();

        // ── If requiredSkills is provided → skill-based suggestions ──
        if (!string.IsNullOrWhiteSpace(requiredSkills))
        {
            var reqSkills = requiredSkills
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s.ToLowerInvariant())
                .ToList();

            var suggestions = employees.Select(user =>
            {
                var current = ComputeWorkload(user);

                // A. Skill Match Score (max 50)
                var userSkills = (user.Skills ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => s.ToLowerInvariant())
                    .ToHashSet();

                var matchedCount = reqSkills.Count(rs => userSkills.Contains(rs));
                var matchPercentage = reqSkills.Count > 0
                    ? Math.Round((double)matchedCount / reqSkills.Count * 100, 1) : 0;
                var skillScore = matchPercentage / 100.0 * 50.0;

                // B. Availability Score (max 30)
                var availabilityScore = Math.Max(0, 1.0 - (current.Workload / 100.0)) * 30.0;

                // C. Performance Score (max 10)
                var performanceScore = ComputePerformanceNew(user) * (10.0 / 15.0);

                // D. Feedback Score (max 5)
                var feedbackScore = ComputeFeedbackScore(user.UserId) * 0.5;

                // E. Manager Review Score (max 5)
                var managerScore = ComputeManagerReviewScore(user.UserId) * 0.5;

                var total = Math.Min(100, Math.Round(skillScore + availabilityScore + performanceScore + feedbackScore + managerScore, 1));

                // ── OVERLOAD PENALTY ──
                if (current.Workload > 120)
                    total = Math.Round(total * 0.4, 1);
                else if (current.Workload > 100)
                    total = Math.Round(total * 0.6, 1);

                // Build reason
                string reason;
                if (matchedCount == reqSkills.Count)
                    reason = $"Full skill match ({matchedCount}/{reqSkills.Count})";
                else if (matchedCount > 0)
                    reason = $"Partial match ({matchedCount}/{reqSkills.Count} skills)";
                else
                    reason = "No skill match — consider for training";

                if (feedbackScore >= 4) reason += " • Excellent feedback";
                else if (feedbackScore >= 3) reason += " • Good feedback";

                var estHours = user.AssignedTasks.Where(t => t.Status != 3 && t.Status != 5 && t.Status != 6).Sum(t => t.EstimatedHours);
                string? warning = null;
                if (current.Workload > 100) warning = "Overloaded";
                else if (current.Workload > 80) warning = "Nearing capacity";

                return new AssignmentSuggestionDto
                {
                    UserId = user.UserId,
                    Name = current.Name,
                    SkillMatchPercentage = matchPercentage,
                    SkillScore = Math.Round(skillScore, 1),
                    AvailabilityScore = Math.Round(availabilityScore, 1),
                    PerformanceScore = Math.Round(performanceScore, 1),
                    ConsistencyScore = 0,
                    FeedbackScore = Math.Round(feedbackScore, 1),
                    ManagerScore = Math.Round(managerScore, 1),
                    AssignmentScore = total,
                    Workload = current.Workload,
                    EstimatedWorkloadHours = Math.Round(estHours, 1),
                    WeeklyCapacity = 40.0,
                    Warning = warning,
                    Reason = reason
                };
            })
            .OrderByDescending(s => s.AssignmentScore)
            .Take(5)
            .ToList();

            return Ok(suggestions);
        }

        // ── No requiredSkills → existing workload-only recommendation ──
        var recommendations = employees
            .Select(user =>
            {
                var current = ComputeWorkload(user);

                var currentEffort = user.AssignedTasks.Where(t => t.Status != 3 && t.Status != 5 && t.Status != 6).Sum(t => t.EstimatedHours);
                var projectedEffort = currentEffort + hours;
                var projectedEffortScore = Math.Min(40.0, (projectedEffort / 40.0) * 40.0);
                var projected = (int)Math.Min(100, Math.Round(
                    projectedEffortScore + current.WeeklyScore + current.PriorityScore + current.DeadlineScore));

                string reason;
                if (current.Workload < 30) reason = "Low workload — has capacity for new tasks";
                else if (current.Workload < 60) reason = "Moderate workload — can take additional tasks";
                else if (current.Workload < 80) reason = "Nearing capacity — consider carefully";
                else if (current.Workload < 90) reason = "High workload — assignment not recommended";
                else reason = "Overloaded — excluded from assignment";

                return new WorkloadRecommendationDto
                {
                    UserId = user.UserId,
                    Name = current.Name,
                    CurrentTasks = current.Tasks,
                    Workload = current.Workload,
                    ProjectedWorkload = projected,
                    Reason = reason
                };
            })
            .Where(r => r.Workload < 90)
            .OrderBy(r => r.ProjectedWorkload)
            .ToList();

        return Ok(recommendations);
    }

    // ═══════════════════════════════════════════════════
    // PERFORMANCE SCORE — completion efficiency (max 20, used for non-skill recommendations)
    // ═══════════════════════════════════════════════════

    private static double ComputePerformance(User user)
    {
        var allTasks = user.AssignedTasks.Count;
        if (allTasks == 0) return 10; // neutral baseline

        var completed = user.AssignedTasks.Count(t => t.Status == 3);
        var efficiency = (double)completed / allTasks; // 0.0 - 1.0

        return Math.Round(efficiency * 20.0, 1);
    }

    // ═══════════════════════════════════════════════════
    // PERFORMANCE SCORE — for 6-signal model (max 15)
    // ═══════════════════════════════════════════════════

    private static double ComputePerformanceNew(User user)
    {
        var allTasks = user.AssignedTasks.Count;
        if (allTasks == 0) return 7.5; // neutral baseline (half of 15)

        var completed = user.AssignedTasks.Count(t => t.Status == 3);
        var efficiency = (double)completed / allTasks;

        return Math.Round(efficiency * 15.0, 1);
    }

    // ═══════════════════════════════════════════════════
    // FEEDBACK SCORE — TeamLead task feedback (max 10)
    // FeedbackScore = (AverageRating / 5) × 10
    // Default = 5 if no feedback exists
    // ═══════════════════════════════════════════════════

    private double ComputeFeedbackScore(int userId)
    {
        var feedbacks = _db.TaskFeedbacks
            .Where(f => f.EmployeeId == userId)
            .Select(f => f.OverallRating)
            .ToList();

        if (!feedbacks.Any()) return 5.0; // default

        var avgRating = feedbacks.Average();
        return Math.Round((avgRating / 5.0) * 10.0, 1);
    }

    // ═══════════════════════════════════════════════════
    // MANAGER REVIEW SCORE — periodic reviews (max 10)
    // ManagerScore = (PerformanceScore / 100) × 10
    // Default = 6 if no review exists
    // ═══════════════════════════════════════════════════

    private double ComputeManagerReviewScore(int userId)
    {
        var reviews = _db.EmployeeReviews
            .Where(r => r.EmployeeId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => r.PerformanceScore)
            .ToList();

        if (!reviews.Any()) return 6.0; // default

        // Use the most recent review
        var latestScore = reviews.First();
        return Math.Round((latestScore / 100.0) * 10.0, 1);
    }

    // ═══════════════════════════════════════════════════
    // CONSISTENCY SCORE — inline computation (max 100 raw → used as 0-10)
    // Same formula as AnalyticsController.ComputeConsistencyScore
    // ═══════════════════════════════════════════════════

    private static double ComputeConsistencyInline(User user)
    {
        var cutoff = DateTime.UtcNow.AddDays(-30);
        var completed = user.AssignedTasks
            .Where(t => t.Status == 3 && t.CompletedDate.HasValue && t.CompletedDate >= cutoff)
            .ToList();

        if (completed.Count < 3) return 70; // default

        // Variance (max 40)
        var variances = completed
            .Where(t => t.EstimatedHours > 0)
            .Select(t =>
            {
                var actual = t.WorkLogs?.Where(w => w.UserId == user.UserId).Sum(w => w.TotalHours) ?? t.EstimatedHours;
                if (actual <= 0) actual = t.EstimatedHours;
                return Math.Abs(actual - t.EstimatedHours) / t.EstimatedHours;
            })
            .ToList();
        var varianceScore = variances.Any() ? Math.Clamp((1.0 - variances.Average()) * 40.0, 0, 40) : 28;

        // Adherence (max 40)
        var withDeadline = completed.Where(t => t.Deadline.HasValue).ToList();
        double adherenceScore = 30;
        if (withDeadline.Any())
        {
            var onTime = withDeadline.Count(t => t.CompletedDate!.Value <= t.Deadline!.Value);
            adherenceScore = ((double)onTime / withDeadline.Count) * 40.0;
        }

        // Overdue (max 20)
        double overdueScore = 15;
        if (withDeadline.Any())
        {
            var overdue = withDeadline.Count(t => t.CompletedDate!.Value > t.Deadline!.Value);
            overdueScore = (1.0 - (double)overdue / withDeadline.Count) * 20.0;
        }

        return Math.Clamp(varianceScore + adherenceScore + overdueScore, 0, 100);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/workload/project-health/{projectId}
    // ═══════════════════════════════════════════════════

    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("project-health/{projectId}")]
    public async Task<IActionResult> GetProjectHealth(int projectId)
    {
        var project = await _db.Tasks
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.TaskId == projectId && t.ParentTaskId == null);

        if (project == null)
            return NotFound(new { message = "Project not found." });

        var subtasks = project.SubTasks.ToList();
        var total = subtasks.Count;
        var completed = subtasks.Count(t => t.Status == 3);
        var overdue = subtasks.Count(t => t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3);
        var critical = subtasks.Count(t => t.Priority == 3 && t.Status != 3);
        var paused = subtasks.Count(t => t.Status == 4);
        var completionPct = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0;

        // Compute health
        string health;
        if (total == 0) health = "No Tasks";
        else if (overdue >= 3 || critical >= 2 || completionPct < 20 && total >= 3) health = "Critical";
        else if (overdue >= 1 || critical >= 1 || paused >= 2) health = "At Risk";
        else health = "Healthy";

        return Ok(new
        {
            projectId,
            projectTitle = project.Title,
            status = project.Status,
            health,
            totalSubTasks = total,
            completedSubTasks = completed,
            overdueSubTasks = overdue,
            criticalSubTasks = critical,
            pausedSubTasks = paused,
            completionPercentage = completionPct
        });
    }
}

