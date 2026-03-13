using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class TaskFeedback
{
    [Key]
    public int FeedbackId { get; set; }

    public int TaskId { get; set; }

    public int EmployeeId { get; set; }

    public int TeamLeadId { get; set; }

    [Range(1, 5)]
    public int WorkQualityRating { get; set; }

    [Range(1, 5)]
    public int TimelinessRating { get; set; }

    [Range(1, 5)]
    public int CommunicationRating { get; set; }

    public double OverallRating { get; set; } // Calculated: avg of 3 ratings

    [MaxLength(1000)]
    public string? Strengths { get; set; }

    [MaxLength(1000)]
    public string? Improvements { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("TaskId")]
    public TaskItem Task { get; set; } = null!;

    [ForeignKey("EmployeeId")]
    public User Employee { get; set; } = null!;

    [ForeignKey("TeamLeadId")]
    public User TeamLead { get; set; } = null!;
}
