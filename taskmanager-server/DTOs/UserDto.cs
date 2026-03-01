namespace TaskManager.API.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<string> Roles { get; set; } = new();
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
}

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public List<string>? Roles { get; set; }
}

public class UpdateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UpdateUserStatusRequest
{
    public bool IsActive { get; set; }
}

public class UpdateUserRolesRequest
{
    public List<string> Roles { get; set; } = new();
}

public class AssignManagerRequest
{
    public int? ManagerId { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedDate { get; set; }

    // Personal profile fields
    public string? MiddleName { get; set; }
    public string? DisplayName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Nationality { get; set; }
    public string? PersonalEmail { get; set; }
    public string? MobileNumber { get; set; }
    public string? WorkNumber { get; set; }

    // About fields
    public string? Bio { get; set; }
    public string? JobLove { get; set; }
    public string? Interests { get; set; }

    // Job/Employment fields
    public string? JobTitle { get; set; }
    public string? WorkerType { get; set; }
    public string? TimeType { get; set; }
    public string? NoticePeriod { get; set; }
    public string? InProbation { get; set; }
    public string? Skills { get; set; }
    public List<string> Roles { get; set; } = new();
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }

    // Team memberships
    public List<ProfileTeamDto> Teams { get; set; } = new();

    // Personal task statistics
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }

    // Work log stats
    public double TotalHoursLogged { get; set; }

    // Leadership stats (Manager, TeamLead, Admin)
    public int DirectReportsCount { get; set; }
    public int ManagedTeamsCount { get; set; }

    // Role-specific: Admin / HR — system-wide overview
    public int? AllUsersCount { get; set; }
    public int? AllTeamsCount { get; set; }
    public int? AllTasksCount { get; set; }
    public int? ActiveUsersCount { get; set; }

    // Role-specific: HR — org health
    public int? InactiveUsersCount { get; set; }
    public int? NewHiresThisMonth { get; set; }
    public int? DepartmentCount { get; set; }
    public int? TotalCompletedTasksOrg { get; set; }

    // Role-specific: Manager / TeamLead — team performance
    public int? TeamMembersCount { get; set; }
    public int? TeamTasksCount { get; set; }
    public int? TeamCompletedTasks { get; set; }
    public double? TeamCompletionRate { get; set; }
    public int? TeamOverdueTasks { get; set; }
    public double? TeamHoursLogged { get; set; }

    // Role-specific: Employee — personal productivity
    public double? AvgHoursPerDay { get; set; }
    public int? TasksCompletedThisWeek { get; set; }
    public int? TasksDueThisWeek { get; set; }
}

public class ProfileTeamDto
{
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string? Role { get; set; } // e.g. "Manager", "Member"
}
