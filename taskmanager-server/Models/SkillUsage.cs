using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class SkillUsage
{
    [Key]
    public int SkillUsageId { get; set; }

    public int EmployeeId { get; set; }

    [Required, MaxLength(100)]
    public string Skill { get; set; } = string.Empty;

    public int TaskId { get; set; }

    public bool CompletedSuccessfully { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("EmployeeId")]
    public User Employee { get; set; } = null!;

    [ForeignKey("TaskId")]
    public TaskItem Task { get; set; } = null!;
}
