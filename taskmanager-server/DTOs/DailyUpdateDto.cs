namespace TaskManager.API.DTOs;

// Response DTO for a single daily update record
public class DailyUpdateStatusDto
{
    public int DailyUpdateId { get; set; }
    public int UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeEmail { get; set; } = string.Empty;
    public DateTime UpdateDate { get; set; }
    public bool IsSent { get; set; }
    public string? Summary { get; set; }
    public string? AcknowledgedByName { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
}

// Request DTO — employee submits/toggles daily update
public class SubmitDailyUpdateDto
{
    public bool IsSent { get; set; }
    public string? Summary { get; set; }
}

// Aggregated consistency metrics for manager/HR views
public class DailyUpdateConsistencyDto
{
    public int UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public int TotalDays { get; set; }
    public int SentDays { get; set; }
    public double ConsistencyPercent { get; set; }
    public string WeekRange { get; set; } = string.Empty;
}

// Team lead view — team member update status
public class TeamDailyUpdateDto
{
    public int UserId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeEmail { get; set; } = string.Empty;
    public bool IsSentToday { get; set; }
    public int? DailyUpdateId { get; set; }
    public string? Summary { get; set; }
    public bool IsAcknowledged { get; set; }
    public int ConsecutiveDays { get; set; }
}
