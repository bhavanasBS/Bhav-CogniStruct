using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class EmployeeReview
{
    [Key]
    public int ReviewId { get; set; }

    public int EmployeeId { get; set; }

    public int ManagerId { get; set; }

    [Required, MaxLength(50)]
    public string ReviewPeriod { get; set; } = string.Empty; // e.g. "2026-Q1", "2026-Feb"

    [Range(0, 100)]
    public int PerformanceScore { get; set; }

    [MaxLength(1000)]
    public string? Strengths { get; set; }

    [MaxLength(1000)]
    public string? ImprovementAreas { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("EmployeeId")]
    public User Employee { get; set; } = null!;

    [ForeignKey("ManagerId")]
    public User Manager { get; set; } = null!;
}
