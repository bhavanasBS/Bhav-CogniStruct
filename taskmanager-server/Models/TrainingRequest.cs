using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class TrainingRequest
{
    [Key]
    public int RequestId { get; set; }

    public int EmployeeId { get; set; }

    [Required, MaxLength(100)]
    public string SkillName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Reason { get; set; }

    // 0=Pending, 1=Approved, 2=Rejected
    public int Status { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    public int? ReviewedById { get; set; }

    // Navigation
    [ForeignKey("EmployeeId")]
    public User Employee { get; set; } = null!;

    [ForeignKey("ReviewedById")]
    public User? ReviewedBy { get; set; }
}
