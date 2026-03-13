using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class Notification
{
    [Key]
    public int NotificationId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public int? RelatedEntityId { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
