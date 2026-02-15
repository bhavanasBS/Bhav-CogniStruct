namespace TaskManager.API.DTOs;

public class UserSettingsDto
{
    public int SettingsId { get; set; }
    public int UserId { get; set; }

    // Profile
    public string TimeZone { get; set; } = "Asia/Kolkata";

    // Notifications
    public bool EmailNotifications { get; set; }
    public bool PushNotifications { get; set; }
    public bool TaskUpdateNotifications { get; set; }
    public bool TeamMessageNotifications { get; set; }

    // Appearance
    public string Theme { get; set; } = "light";
    public bool CompactMode { get; set; }

    // Privacy
    public bool ShowOnlineStatus { get; set; }
    public bool ShowLastSeen { get; set; }
}

public class UpdateSettingsRequest
{
    // Profile
    public string? TimeZone { get; set; }

    // Notifications
    public bool? EmailNotifications { get; set; }
    public bool? PushNotifications { get; set; }
    public bool? TaskUpdateNotifications { get; set; }
    public bool? TeamMessageNotifications { get; set; }

    // Appearance
    public string? Theme { get; set; }
    public bool? CompactMode { get; set; }

    // Privacy
    public bool? ShowOnlineStatus { get; set; }
    public bool? ShowLastSeen { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? TimeZone { get; set; }
}
