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

    /// <summary>0=Pending, 1=Assigned, 2=InProgress, 3=Completed, 4=Paused, 5=Blocked, 6=Cancelled</summary>
    public int Status { get; set; } = 0;

    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedDate { get; set; }

    /// <summary>Set when status changes to InProgress. Used for SLA computation.</summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>Set when task is paused (Status=4). Cleared on resume.</summary>
    public DateTime? PausedAt { get; set; }

    [MaxLength(500)]
    public string? PauseReason { get; set; }

    /// <summary>SLA target hours from StartedAt. Null = no SLA.</summary>
    public double? SlaHours { get; set; }

    /// <summary>True when UtcNow > StartedAt + SlaHours.</summary>
    public bool SlaBreached { get; set; } = false;

    /// <summary>Comma-separated required skills (e.g. "React,SQL,API")</summary>
    [MaxLength(500)]
    public string? RequiredSkills { get; set; }

    // ── Hierarchy ──
    /// <summary>Null = parent/project task. Set = subtask under a project.</summary>
    public int? ParentTaskId { get; set; }
    public TaskItem? ParentTask { get; set; }
    public ICollection<TaskItem> SubTasks { get; set; } = new List<TaskItem>();

    // Navigation
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
}
