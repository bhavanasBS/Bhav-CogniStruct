using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class WorkLog
{
    [Key]
    public int WorkLogId { get; set; }

    public int TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double TotalHours { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
