namespace TaskManager.API.DTOs;

// ─── Analytics DTOs ────────────────────────────────

public class CompletionRateDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double Rate { get; set; }
    public List<DailyCompletionDto> Daily { get; set; } = new();
}

public class DailyCompletionDto
{
    public string Name { get; set; } = string.Empty;
    public int Completed { get; set; }
    public int InProgress { get; set; }
    public int Pending { get; set; }
}

public class AvgCompletionTimeDto
{
    public double AverageHours { get; set; }
    public double AverageDays { get; set; }
}

public class ProductivityScoreDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Tasks { get; set; }
    public double Hours { get; set; }
    public double Efficiency { get; set; }
    public int Streak { get; set; }
}

public class TeamComparisonDto
{
    public string Name { get; set; } = string.Empty;
    public int Tasks { get; set; }
    public double Efficiency { get; set; }
}

public class WeeklyProductivityDto
{
    public string Name { get; set; } = string.Empty;
    public int Tasks { get; set; }
    public double Hours { get; set; }
}

public class TaskDistributionDto
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class ActivityStreamDto
{
    public string Time { get; set; } = string.Empty;
    public int TaskCreated { get; set; }
    public int TaskCompleted { get; set; }
    public int LogsAdded { get; set; }
}

// ─── Workload DTOs ─────────────────────────────────

public class WorkloadMemberDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Tasks { get; set; }
    public int MaxTasks { get; set; }
    public double Hours { get; set; }
    public double MaxHours { get; set; }
    public int Workload { get; set; }

    // Task-based workload fields
    public double EstimatedWorkloadHours { get; set; }
    public double LoggedHours { get; set; }
    public double WeeklyCapacity { get; set; } = 40.0;
    public double RemainingHours { get; set; }

    // Effort-based breakdown
    public double EffortScore { get; set; }
    public double WeeklyScore { get; set; }
    public double PriorityScore { get; set; }
    public double DeadlineScore { get; set; }
    public int PausedTasks { get; set; }
}

public class TeamWorkloadDto
{
    public string Name { get; set; } = string.Empty;
    public int Workload { get; set; }
    public int Members { get; set; }
}

public class WorkloadRecommendationDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CurrentTasks { get; set; }
    public int Workload { get; set; }
    public int ProjectedWorkload { get; set; }
    public string Reason { get; set; } = string.Empty;
}

// ─── Consistency Score DTOs ────────────────────────

public class ConsistencyScoreDto
{
    public int UserId { get; set; }
    public double ConsistencyRaw { get; set; }
    public double VarianceScore { get; set; }
    public double AdherenceScore { get; set; }
    public double OverdueScore { get; set; }
    public int CompletedTasksCount { get; set; }
}

// ─── Assignment Suggestion DTOs ────────────────────

public class AssignmentSuggestionDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double SkillMatchPercentage { get; set; }
    public double SkillScore { get; set; }
    public double AvailabilityScore { get; set; }
    public double PerformanceScore { get; set; }
    public double ConsistencyScore { get; set; }
    public double FeedbackScore { get; set; }
    public double ManagerScore { get; set; }
    public double AssignmentScore { get; set; }
    public int Workload { get; set; }
    public double EstimatedWorkloadHours { get; set; }
    public double WeeklyCapacity { get; set; } = 40.0;
    public string? Warning { get; set; }
    public string Reason { get; set; } = string.Empty;
}

// ─── Manager DTOs ──────────────────────────────────

public class ManagerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Department { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int TeamSize { get; set; }
    public List<string> Teams { get; set; } = new();
    public string? Location { get; set; }
    public string? ReportsTo { get; set; }
}

public class ManagerDashboardDto
{
    public List<TeamReportDto> TeamReports { get; set; } = new();
    public int TotalTeams { get; set; }
    public int ActiveTasks { get; set; }
    public double TotalHours { get; set; }
    public double AvgEfficiency { get; set; }
}

public class TeamReportDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Lead { get; set; } = string.Empty;
    public int Members { get; set; }
    public int ActiveTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double TotalHours { get; set; }
    public double Efficiency { get; set; }
    public string Status { get; set; } = "on-track";
}

// ─── Paginated Response ────────────────────────────

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

// ─── Role DTO ──────────────────────────────────────

public class RoleDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int UserCount { get; set; }
}

// ─── Dashboard DTO (summary for DashboardPage) ────

public class DashboardSummaryDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TotalMembers { get; set; }
    public double TotalHoursLogged { get; set; }
    public double CompletionRate { get; set; }
    public List<TaskDto> RecentTasks { get; set; } = new();
    public List<ActivityFeedItem> RecentActivities { get; set; } = new();
    public List<DailyCompletionDto> WeeklyActivity { get; set; } = new();
    public List<TaskDistributionDto> TaskDistribution { get; set; } = new();
}

public class ActivityFeedItem
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

// ─── Employee Productivity DTOs ────────────────────

public class EmployeeProductivityDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int CompletedTasks { get; set; }
    public double AverageCompletionTime { get; set; } // in hours
    public double OverdueRate { get; set; }            // 0.0 - 100.0
    public double ProductivityScore { get; set; }      // 0.0 - 100.0
    public double ConsistencyScore { get; set; }       // 0.0 - 100.0
}

