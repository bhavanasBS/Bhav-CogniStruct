using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class Project
{
    [Key]
    public int ProjectId { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>FK → User who created this project (Manager)</summary>
    public int CreatedByManagerId { get; set; }
    public User? CreatedByManager { get; set; }

    /// <summary>FK → User who leads this project (TeamLead), nullable</summary>
    public int? LeadId { get; set; }
    public User? Lead { get; set; }

    /// <summary>0=Active, 1=Completed, 2=Archived</summary>
    public int Status { get; set; } = 0;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    /// <summary>FK → Team this project belongs to (nullable)</summary>
    public int? TeamId { get; set; }
    public Team? Team { get; set; }

    // Navigation
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
