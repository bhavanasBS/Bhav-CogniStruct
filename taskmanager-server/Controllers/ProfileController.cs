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
        profile.AllTasksCount = await _db.Tasks.CountAsync();
        profile.TotalCompletedTasksOrg = await _db.Tasks.CountAsync(t => t.Status == 3);

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
            managerName = user.Manager != null ? $"{user.Manager.FirstName} {user.Manager.LastName}" : null
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
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            InProgressTasks = inProgressTasks,
            PendingTasks = pendingTasks,
            OverdueTasks = overdueTasks,
            TotalHoursLogged = totalHours,
            DirectReportsCount = directReports
        };
    }
}
