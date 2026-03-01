using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

/// <summary>
/// Tracks lifecycle actions on tasks (pause, resume, status changes)
/// for compliance and governance auditing.
/// </summary>
public class TaskAuditLog
{
    [Key]
    public int AuditId { get; set; }

    public int TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;

    /// <summary>Who performed the action</summary>
    public int PerformedByUserId { get; set; }
    public User PerformedBy { get; set; } = null!;

    /// <summary>e.g. "paused", "resumed", "status_changed", "assigned"</summary>
    [Required, MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    /// <summary>Details: old deadline, new deadline, reason, etc.</summary>
    [MaxLength(2000)]
    public string? Details { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
