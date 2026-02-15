namespace TaskManager.API.DTOs;

public class WorkLogDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public string? TaskTitle { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double TotalHours { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class CreateWorkLogRequest
{
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double TotalHours { get; set; }
    public string? Description { get; set; }
}

public class UpdateWorkLogRequest
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double? TotalHours { get; set; }
    public string? Description { get; set; }
}

public class WorkLogSummaryDto
{
    public double TotalHours { get; set; }
    public int TotalEntries { get; set; }
    public double AveragePerDay { get; set; }
    public List<DailySummary> DailyBreakdown { get; set; } = new();
}

public class DailySummary
{
    public DateTime Date { get; set; }
    public double Hours { get; set; }
    public int Entries { get; set; }
}

public class WeeklyWorkLogDto
{
    public string Day { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public double Hours { get; set; }
    public int Tasks { get; set; }
}
