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
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? PersonalEmail { get; set; }
    public string? MobileNumber { get; set; }
    public string? WorkNumber { get; set; }
    public string? TimeZone { get; set; }
    // About fields
    public string? Bio { get; set; }
    public string? JobLove { get; set; }
    public string? Interests { get; set; }
    // Job fields
    public string? JobTitle { get; set; }
    public string? WorkerType { get; set; }
    public string? TimeType { get; set; }
    public string? NoticePeriod { get; set; }
    public string? InProbation { get; set; }
    public string? Skills { get; set; }
}
