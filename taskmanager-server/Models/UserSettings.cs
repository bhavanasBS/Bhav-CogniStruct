using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class UserSettings
{
    [Key]
    public int SettingsId { get; set; }

    [Required]
    public int UserId { get; set; }

    // Profile
    [MaxLength(50)]
    public string TimeZone { get; set; } = "Asia/Kolkata";

    // Notifications
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool TaskUpdateNotifications { get; set; } = true;
    public bool TeamMessageNotifications { get; set; } = false;

    // Appearance
    [MaxLength(20)]
    public string Theme { get; set; } = "light";
    public bool CompactMode { get; set; } = false;

    // Privacy
    public bool ShowOnlineStatus { get; set; } = true;
    public bool ShowLastSeen { get; set; } = true;

    public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
