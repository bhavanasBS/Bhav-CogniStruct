using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/workload")]
[Authorize(Roles = "Admin,Manager,HR")]
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
            .Where(t => t.Status != 3 && t.ParentTaskId != null).ToList();

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
            // New breakdown
            EffortScore = Math.Round(effortScore, 1),
            WeeklyScore = Math.Round(weeklyScore, 1),
            PriorityScore = Math.Round(priorityScore, 1),
            DeadlineScore = Math.Round(deadlineScore, 1),
            PausedTasks = pausedCount
        };
    }

    // ═══════════════════════════════════════════════════
    // GET /api/workload/team/{teamId}
    // ═══════════════════════════════════════════════════

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(int teamId)
    {
        var members = await _db.Set<TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User).ThenInclude(u => u.AssignedTasks)
            .Include(m => m.User).ThenInclude(u => u.WorkLogs)
            .Include(m => m.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ToListAsync();

        var result = members
            .Select(m => ComputeWorkload(m.User))
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

    // ═══════════════════════════════════════════════════
    // GET /api/workload/recommend/{teamId}?hours=8&requiredSkills=React,SQL
    // When requiredSkills is absent → existing behavior (WorkloadRecommendationDto)
    // When requiredSkills is present → skill-based suggestions (AssignmentSuggestionDto)
    // ═══════════════════════════════════════════════════

    [HttpGet("recommend/{teamId}")]
    public async Task<IActionResult> Recommend(
        int teamId,
        [FromQuery] double hours = 8,
        [FromQuery] string? requiredSkills = null)
    {
        // Validate Manager ownership
        if (User.IsInRole("Manager") && !User.IsInRole("Admin") && !User.IsInRole("HR"))
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var uid))
            {
                var team = await _db.Teams.FindAsync(teamId);
                if (team == null) return NotFound();
                if (team.ManagerId != uid)
                    return StatusCode(403, new { message = "You can only view recommendations for teams you manage." });
            }
        }

        var members = await _db.Set<TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User).ThenInclude(u => u.AssignedTasks).ThenInclude(t => t.WorkLogs)
            .Include(m => m.User).ThenInclude(u => u.WorkLogs)
            .Include(m => m.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ToListAsync();

        // ── If requiredSkills is provided → skill-based suggestions ──
        if (!string.IsNullOrWhiteSpace(requiredSkills))
        {
            var reqSkills = requiredSkills
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s.ToLowerInvariant())
                .ToList();

            var suggestions = members.Select(m =>
            {
                var user = m.User;
                var current = ComputeWorkload(user);

                // A. Skill Match Score (max 40)
                var userSkills = (user.Skills ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => s.ToLowerInvariant())
                    .ToHashSet();

                var matchedCount = reqSkills.Count(rs => userSkills.Contains(rs));
                var matchPercentage = reqSkills.Count > 0
                    ? Math.Round((double)matchedCount / reqSkills.Count * 100, 1) : 0;
                var skillScore = matchPercentage / 100.0 * 40.0;

                // B. Availability Score (max 30)
                var availabilityScore = (100.0 - current.Workload) * 0.30;

                // C. Performance Score (max 20)
                var performanceScore = ComputePerformance(user);

                // D. Consistency Score (max 10)
                var consistencyScore = ComputeConsistencyInline(user) * 0.10;

                var total = Math.Min(100, Math.Round(skillScore + availabilityScore + performanceScore + consistencyScore, 1));

                // Build reason
                string reason;
                if (matchedCount == reqSkills.Count)
                    reason = $"Full skill match ({matchedCount}/{reqSkills.Count})";
                else if (matchedCount > 0)
                    reason = $"Partial match ({matchedCount}/{reqSkills.Count} skills)";
                else
                    reason = "No skill match — consider for training";

                return new AssignmentSuggestionDto
                {
                    UserId = m.UserId,
                    Name = current.Name,
                    SkillMatchPercentage = matchPercentage,
                    SkillScore = Math.Round(skillScore, 1),
                    AvailabilityScore = Math.Round(availabilityScore, 1),
                    PerformanceScore = Math.Round(performanceScore, 1),
                    ConsistencyScore = Math.Round(consistencyScore, 1),
                    AssignmentScore = total,
                    Workload = current.Workload,
                    Reason = reason
                };
            })
            .OrderByDescending(s => s.AssignmentScore)
            .ToList();

            return Ok(suggestions);
        }

        // ── No requiredSkills → existing workload-only recommendation ──
        var recommendations = members
            .Select(m =>
            {
                var current = ComputeWorkload(m.User);

                var currentEffort = m.User.AssignedTasks.Where(t => t.Status != 3).Sum(t => t.EstimatedHours);
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
                    UserId = m.UserId,
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
    // PERFORMANCE SCORE — completion efficiency (max 20)
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
            .Include(t => t.Team)
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
            teamName = project.Team?.TeamName,
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

