using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;

namespace TaskManager.API.Controllers;

/// <summary>
/// Role-based profile endpoints — each role has its own dedicated endpoint
/// secured with [Authorize(Roles = "...")].
/// </summary>
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfileController(AppDbContext db) => _db = db;

    // ═══════════════════════════════════════════════════
    // GET /api/admin/profile
    // ═══════════════════════════════════════════════════
    [HttpGet("api/admin/profile")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminProfile()
    {
        var (user, roles) = await GetUserWithRoles();
        if (user == null) return Unauthorized(new { message = "Could not identify user." });

        var profile = await BuildBaseProfile(user, roles);

        // Admin-specific: System-wide overview
        profile.AllUsersCount = await _db.Users.CountAsync();
        profile.ActiveUsersCount = await _db.Users.CountAsync(u => u.IsActive);
        profile.InactiveUsersCount = await _db.Users.CountAsync(u => !u.IsActive);
        profile.AllTeamsCount = await _db.Teams.CountAsync(t => t.IsActive);
        profile.AllTasksCount = await _db.Tasks.CountAsync();
        profile.TotalCompletedTasksOrg = await _db.Tasks.CountAsync(t => t.Status == 3);

        // Admin team performance (if managing teams)
        var managedTeamIds = await _db.Teams
            .Where(t => t.ManagerId == user.UserId && t.IsActive)
            .Select(t => t.TeamId).ToListAsync();
        if (managedTeamIds.Count > 0)
            await PopulateTeamPerformance(profile, managedTeamIds);

        return Ok(profile);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/hr/profile
    // ═══════════════════════════════════════════════════
    [HttpGet("api/hr/profile")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetHRProfile()
    {
        var (user, roles) = await GetUserWithRoles();
        if (user == null) return Unauthorized(new { message = "Could not identify user." });

        var profile = await BuildBaseProfile(user, roles);

        // HR-specific: Org health & workforce analytics
        profile.AllUsersCount = await _db.Users.CountAsync();
        profile.ActiveUsersCount = await _db.Users.CountAsync(u => u.IsActive);
        profile.InactiveUsersCount = await _db.Users.CountAsync(u => !u.IsActive);
        profile.AllTeamsCount = await _db.Teams.CountAsync(t => t.IsActive);
        profile.AllTasksCount = await _db.Tasks.CountAsync();
        profile.TotalCompletedTasksOrg = await _db.Tasks.CountAsync(t => t.Status == 3);

        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        profile.NewHiresThisMonth = await _db.Users.CountAsync(u => u.CreatedDate >= monthStart);
        profile.DepartmentCount = await _db.Teams.CountAsync(t => t.IsActive);

        return Ok(profile);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/manager/profile
    // ═══════════════════════════════════════════════════
    [HttpGet("api/manager/profile")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetManagerProfile()
    {
        var (user, roles) = await GetUserWithRoles();
        if (user == null) return Unauthorized(new { message = "Could not identify user." });

        var profile = await BuildBaseProfile(user, roles);

        // Manager-specific: Team performance
        var managedTeamIds = await _db.Teams
            .Where(t => t.ManagerId == user.UserId && t.IsActive)
            .Select(t => t.TeamId).ToListAsync();

        if (managedTeamIds.Count > 0)
            await PopulateTeamPerformance(profile, managedTeamIds);
        else
            SetEmptyTeamPerformance(profile);

        return Ok(profile);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/teamlead/profile
    // ═══════════════════════════════════════════════════
    [HttpGet("api/teamlead/profile")]
    [Authorize(Roles = "Admin,TeamLead,Team Lead")]
    public async Task<IActionResult> GetTeamLeadProfile()
    {
        var (user, roles) = await GetUserWithRoles();
        if (user == null) return Unauthorized(new { message = "Could not identify user." });

        var profile = await BuildBaseProfile(user, roles);

        // TeamLead-specific: Team stats (managed + member teams)
        var managedTeamIds = await _db.Teams
            .Where(t => t.ManagerId == user.UserId && t.IsActive)
            .Select(t => t.TeamId).ToListAsync();

        var memberTeamIds = await _db.TeamMembers
            .Where(tm => tm.UserId == user.UserId)
            .Select(tm => tm.TeamId).ToListAsync();

        var allTeamIds = managedTeamIds.Union(memberTeamIds).Distinct().ToList();

        if (allTeamIds.Count > 0)
            await PopulateTeamPerformance(profile, allTeamIds);
        else
            SetEmptyTeamPerformance(profile);

        return Ok(profile);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/employee/profile
    // ═══════════════════════════════════════════════════
    [HttpGet("api/employee/profile")]
    [Authorize]
    public async Task<IActionResult> GetEmployeeProfile()
    {
        var (user, roles) = await GetUserWithRoles();
        if (user == null) return Unauthorized(new { message = "Could not identify user." });

        var profile = await BuildBaseProfile(user, roles);

        // Employee-specific: Personal productivity
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var recentLogs = await _db.WorkLogs
            .Where(w => w.UserId == user.UserId && w.StartTime >= thirtyDaysAgo)
            .ToListAsync();

        var daysWithLogs = recentLogs.Select(w => w.StartTime.Date).Distinct().Count();
        profile.AvgHoursPerDay = daysWithLogs > 0
            ? Math.Round(recentLogs.Sum(w => (double)w.TotalHours) / daysWithLogs, 1)
            : 0;

        var tasks = await _db.Tasks.Where(t => t.AssigneeId == user.UserId).ToListAsync();
        var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        profile.TasksCompletedThisWeek = tasks.Count(t =>
            t.Status == 3 && t.CompletedDate.HasValue && t.CompletedDate.Value >= weekStart);

        var weekEnd = weekStart.AddDays(7);
        profile.TasksDueThisWeek = tasks.Count(t =>
            t.Deadline.HasValue && t.Deadline.Value >= weekStart && t.Deadline.Value < weekEnd && t.Status != 3);

        return Ok(profile);
    }

    // ═══════════════════════════════════════════════════
    // PUT /api/users/me/profile — Update own profile
    // ═══════════════════════════════════════════════════
    [HttpPut("api/users/me/profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest req)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Could not identify user." });

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        // Update only provided fields
        if (req.FirstName != null) user.FirstName = req.FirstName;
        if (req.MiddleName != null) user.MiddleName = req.MiddleName;
        if (req.LastName != null) user.LastName = req.LastName;
        if (req.DisplayName != null) user.DisplayName = req.DisplayName;
        if (req.Gender != null) user.Gender = req.Gender;
        if (req.DateOfBirth.HasValue) user.DateOfBirth = req.DateOfBirth;
        if (req.Nationality != null) user.Nationality = req.Nationality;
        if (req.PersonalEmail != null) user.PersonalEmail = req.PersonalEmail;
        if (req.MobileNumber != null) user.MobileNumber = req.MobileNumber;
        if (req.WorkNumber != null) user.WorkNumber = req.WorkNumber;
        if (req.Bio != null) user.Bio = req.Bio;
        if (req.JobLove != null) user.JobLove = req.JobLove;
        if (req.Interests != null) user.Interests = req.Interests;
        if (req.JobTitle != null) user.JobTitle = req.JobTitle;
        if (req.WorkerType != null) user.WorkerType = req.WorkerType;
        if (req.TimeType != null) user.TimeType = req.TimeType;
        if (req.NoticePeriod != null) user.NoticePeriod = req.NoticePeriod;
        if (req.InProbation != null) user.InProbation = req.InProbation;
        if (req.Skills != null) user.Skills = req.Skills;

        user.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully." });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/users/{id}/public-profile — Read-only public view
    // ═══════════════════════════════════════════════════
    [HttpGet("api/users/{id}/public-profile")]
    [Authorize]
    public async Task<IActionResult> GetPublicProfile(int id)
    {
        var user = await _db.Users
            .Include(u => u.Manager)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == id && u.IsActive);

        if (user == null)
            return NotFound(new { message = "User not found." });

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

        var memberships = await _db.TeamMembers
            .Include(tm => tm.Team)
            .Where(tm => tm.UserId == id)
            .ToListAsync();

        var teamMemberships = memberships.Select(tm => new ProfileTeamDto
        {
            TeamId = tm.TeamId,
            TeamName = tm.Team?.TeamName ?? "Unknown",
            Role = tm.Team?.ManagerId == id ? "Manager" : "Member"
        }).ToList();

        // Return public-safe fields
        return Ok(new
        {
            id = user.UserId,
            firstName = user.FirstName,
            lastName = user.LastName,
            displayName = user.DisplayName,
            email = user.Email,
            gender = user.Gender,
            dateOfBirth = user.DateOfBirth,
            nationality = user.Nationality,
            personalEmail = user.PersonalEmail,
            mobileNumber = user.MobileNumber,
            workNumber = user.WorkNumber,
            profileImageUrl = user.ProfileImageUrl,
            createdDate = user.CreatedDate,
            roles,
            bio = user.Bio,
            jobLove = user.JobLove,
            interests = user.Interests,
            jobTitle = user.JobTitle,
            skills = user.Skills,
            workerType = user.WorkerType,
            timeType = user.TimeType,
            managerId = user.ManagerId,
            managerName = user.Manager != null ? $"{user.Manager.FirstName} {user.Manager.LastName}" : null,
            teams = teamMemberships
        });
    }

    // ═══════════════════════════════════════════════════
    // SHARED HELPERS
    // ═══════════════════════════════════════════════════

    private async Task<(Models.User? user, List<string> roles)> GetUserWithRoles()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
            return (null, new List<string>());

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.Manager)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        var roles = user?.UserRoles.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>();
        return (user, roles);
    }

    private async Task<UserProfileDto> BuildBaseProfile(Models.User user, List<string> roles)
    {
        // Personal task stats
        var tasks = await _db.Tasks.Where(t => t.AssigneeId == user.UserId).ToListAsync();
        var totalTasks = tasks.Count;
        var completedTasks = tasks.Count(t => t.Status == 3);
        var inProgressTasks = tasks.Count(t => t.Status == 2);
        var pendingTasks = tasks.Count(t => t.Status == 0 || t.Status == 1);
        var overdueTasks = tasks.Count(t =>
            t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3);

        // Work log hours
        var totalHours = await _db.WorkLogs
            .Where(w => w.UserId == user.UserId)
            .SumAsync(w => (double?)w.TotalHours) ?? 0;

        // Leadership stats
        var directReports = await _db.Users.CountAsync(u => u.ManagerId == user.UserId && u.IsActive);
        var managedTeamsCount = await _db.Teams.CountAsync(t => t.ManagerId == user.UserId && t.IsActive);

        // Team memberships
        var memberships = await _db.TeamMembers
            .Include(tm => tm.Team)
            .Where(tm => tm.UserId == user.UserId)
            .ToListAsync();

        var teams = memberships
            .Select(tm => new ProfileTeamDto
            {
                TeamId = tm.TeamId,
                TeamName = tm.Team?.TeamName ?? "Unknown",
                Role = tm.Team?.ManagerId == user.UserId ? "Manager" : "Member"
            }).ToList();

        // Add managed teams not in memberships
        var managedTeams = await _db.Teams
            .Where(t => t.ManagerId == user.UserId && t.IsActive)
            .ToListAsync();

        foreach (var mt in managedTeams)
        {
            if (!teams.Any(t => t.TeamId == mt.TeamId))
            {
                teams.Add(new ProfileTeamDto
                {
                    TeamId = mt.TeamId,
                    TeamName = mt.TeamName,
                    Role = "Manager"
                });
            }
        }

        return new UserProfileDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            IsActive = user.IsActive,
            ProfileImageUrl = user.ProfileImageUrl,
            CreatedDate = user.CreatedDate,
            MiddleName = user.MiddleName,
            DisplayName = user.DisplayName,
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth,
            Nationality = user.Nationality,
            PersonalEmail = user.PersonalEmail,
            MobileNumber = user.MobileNumber,
            WorkNumber = user.WorkNumber,
            Bio = user.Bio,
            JobLove = user.JobLove,
            Interests = user.Interests,
            JobTitle = user.JobTitle,
            WorkerType = user.WorkerType,
            TimeType = user.TimeType,
            NoticePeriod = user.NoticePeriod,
            InProbation = user.InProbation,
            Skills = user.Skills,
            Roles = roles,
            ManagerId = user.ManagerId,
            ManagerName = user.Manager != null ? $"{user.Manager.FirstName} {user.Manager.LastName}" : null,
            Teams = teams,
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            InProgressTasks = inProgressTasks,
            PendingTasks = pendingTasks,
            OverdueTasks = overdueTasks,
            TotalHoursLogged = totalHours,
            DirectReportsCount = directReports,
            ManagedTeamsCount = managedTeamsCount
        };
    }

    private async Task PopulateTeamPerformance(UserProfileDto profile, List<int> teamIds)
    {
        var memberCount = await _db.TeamMembers
            .Where(tm => teamIds.Contains(tm.TeamId))
            .Select(tm => tm.UserId).Distinct().CountAsync();

        var teamTasks = await _db.Tasks
            .Where(t => t.TeamId.HasValue && teamIds.Contains(t.TeamId.Value))
            .ToListAsync();

        var teamCompleted = teamTasks.Count(t => t.Status == 3);
        var teamOverdue = teamTasks.Count(t =>
            t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3);

        var memberIds = await _db.TeamMembers
            .Where(tm => teamIds.Contains(tm.TeamId))
            .Select(tm => tm.UserId).Distinct().ToListAsync();

        var teamHours = await _db.WorkLogs
            .Where(w => memberIds.Contains(w.UserId))
            .SumAsync(w => (double?)w.TotalHours) ?? 0;

        profile.TeamMembersCount = memberCount;
        profile.TeamTasksCount = teamTasks.Count;
        profile.TeamCompletedTasks = teamCompleted;
        profile.TeamCompletionRate = teamTasks.Count > 0
            ? Math.Round((double)teamCompleted / teamTasks.Count * 100, 1) : 0;
        profile.TeamOverdueTasks = teamOverdue;
        profile.TeamHoursLogged = Math.Round(teamHours, 1);
    }

    private void SetEmptyTeamPerformance(UserProfileDto profile)
    {
        profile.TeamMembersCount = 0;
        profile.TeamTasksCount = 0;
        profile.TeamCompletedTasks = 0;
        profile.TeamCompletionRate = 0;
        profile.TeamOverdueTasks = 0;
        profile.TeamHoursLogged = 0;
    }
}
