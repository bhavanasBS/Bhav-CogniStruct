using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class DailyUpdateStatus
{
    [Key]
    public int DailyUpdateId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime UpdateDate { get; set; } // Date only (no time component)

    public bool IsSent { get; set; } = false;

    [MaxLength(500)]
    public string? Summary { get; set; }

    public int? AcknowledgedByUserId { get; set; }
    public User? AcknowledgedBy { get; set; }

    public DateTime? AcknowledgedAt { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
}
