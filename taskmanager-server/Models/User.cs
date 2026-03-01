using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class User
{
    [Key]
    public int UserId { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [MaxLength(500)]
    public string? ProfileImageUrl { get; set; }

    // Personal profile fields
    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [MaxLength(200)]
    public string? DisplayName { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(100)]
    public string? Nationality { get; set; }

    [MaxLength(200)]
    public string? PersonalEmail { get; set; }

    [MaxLength(20)]
    public string? MobileNumber { get; set; }

    [MaxLength(20)]
    public string? WorkNumber { get; set; }

    // About fields
    [MaxLength(2000)]
    public string? Bio { get; set; }

    [MaxLength(1000)]
    public string? JobLove { get; set; }

    [MaxLength(1000)]
    public string? Interests { get; set; }

    // Job/Employment fields
    [MaxLength(200)]
    public string? JobTitle { get; set; }

    [MaxLength(50)]
    public string? WorkerType { get; set; }

    [MaxLength(50)]
    public string? TimeType { get; set; }

    [MaxLength(100)]
    public string? NoticePeriod { get; set; }

    [MaxLength(200)]
    public string? InProbation { get; set; }

    // Skills (comma-separated)
    [MaxLength(2000)]
    public string? Skills { get; set; }

    // Reporting Manager (org hierarchy)
    public int? ManagerId { get; set; }
    public User? Manager { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    public ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
    public ICollection<WorkLog> WorkLogs { get; set; } = new List<WorkLog>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Team> ManagedTeams { get; set; } = new List<Team>();
    public ICollection<DailyUpdateStatus> DailyUpdates { get; set; } = new List<DailyUpdateStatus>();
    public ICollection<User> Subordinates { get; set; } = new List<User>();
}
