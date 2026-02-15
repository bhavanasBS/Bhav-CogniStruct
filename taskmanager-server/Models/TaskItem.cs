using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

/// <summary>
/// Named TaskItem to avoid conflict with System.Threading.Tasks.Task
/// Maps to "Tasks" table in DB
/// </summary>
public class TaskItem
{
    [Key]
    public int TaskId { get; set; }

    [Required, MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Description { get; set; }

    public int? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public int? AssignerId { get; set; }
    public User? Assigner { get; set; }

    public int? TeamId { get; set; }
    public Team? Team { get; set; }

    /// <summary>0=Low, 1=Medium, 2=High, 3=Critical</summary>
    public int Priority { get; set; } = 1;

    /// <summary>0=Pending, 1=Assigned, 2=InProgress, 3=Completed</summary>
    public int Status { get; set; } = 0;

    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDate { get; set; }

    // Navigation
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
