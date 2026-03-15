using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class Team
{
    [Key]
    public int TeamId { get; set; }

    [Required, MaxLength(200)]
    public string TeamName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>FK → User who manages this team (Manager / Team Lead)</summary>
    public int? ManagerId { get; set; }
    public User? Manager { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
