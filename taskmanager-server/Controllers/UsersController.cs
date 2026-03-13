using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // Admin can view all users
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? role, [FromQuery] string? status)
    {
        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                u.FirstName.Contains(search) ||
                u.LastName.Contains(search) ||
                u.Email.Contains(search));

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == role));

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.Equals("unallocated", StringComparison.OrdinalIgnoreCase))
            {
                // Only Employee-role users with no manager assigned
                query = query.Where(u =>
                    u.ManagerId == null
                    && u.IsActive
                    && u.UserRoles.Any(ur => ur.Role.RoleName == "Employee"));
            }
            else
            {
                bool isActive = status.Equals("active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(u => u.IsActive == isActive);
            }
        }

        var result = await query.OrderBy(u => u.FirstName)
            .Select(u => new UserDto
            {
                Id = u.UserId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
                IsActive = u.IsActive,
                CreatedDate = u.CreatedDate,
                ManagerId = u.ManagerId,
                ManagerName = u.Manager != null ? u.Manager.FirstName + " " + u.Manager.LastName : null
            }).ToListAsync();

        return Ok(result);
    }

    // Admin can view any user
    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate
        });
    }

    // Only Admin can create users
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "Email already exists." });

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Assign roles
        if (request.Roles?.Any() == true)
        {
            var roles = await _db.Roles
                .Where(r => request.Roles.Contains(r.RoleName))
                .ToListAsync();

            foreach (var role in roles)
            {
                _db.Set<UserRole>().Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = user.UserId }, new UserDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = request.Roles ?? new List<string>(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate
        });
    }

    // Only Admin can update users
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName ?? user.FirstName;
        user.LastName = request.LastName ?? user.LastName;
        user.Email = request.Email ?? user.Email;
        user.UpdatedDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "User updated." });
    }

    // Only Admin can change user status
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = request.IsActive;
        user.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Status updated." });
    }

    // Only Admin can change user roles
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(int id, [FromBody] UpdateUserRolesRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return NotFound();

        // Remove existing roles
        _db.Set<UserRole>().RemoveRange(user.UserRoles);

        // Add new roles
        var roles = await _db.Roles
            .Where(r => request.Roles.Contains(r.RoleName))
            .ToListAsync();

        foreach (var role in roles)
        {
            _db.Set<UserRole>().Add(new UserRole { UserId = id, RoleId = role.RoleId });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Roles updated." });
    }

    // Only Admin can delete users
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User deleted." });
    }

    // Admin can assign a reporting manager to a user
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/assign-manager")]
    public async Task<IActionResult> AssignManager(int id, [FromBody] AssignManagerRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (request.ManagerId.HasValue)
        {
            var manager = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == request.ManagerId.Value);
            if (manager == null) return NotFound(new { message = "Manager not found." });

            // Prevent self-assignment
            if (id == request.ManagerId.Value)
                return BadRequest(new { message = "A user cannot be their own manager." });
        }

        user.ManagerId = request.ManagerId;
        user.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = request.ManagerId.HasValue ? "Manager assigned." : "Manager removed." });
    }

    // Manager can view their direct reports
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("my-employees")]
    public async Task<IActionResult> GetMyEmployees()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var currentUserId))
            return Unauthorized();

        var employees = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.ManagerId == currentUserId && u.IsActive
                        && u.UserRoles.Any(ur => ur.Role.RoleName == "Employee" || ur.Role.RoleName == "TeamLead"))
            .OrderBy(u => u.FirstName)
            .ToListAsync();

        var result = employees.Select(u => new UserDto
        {
            Id = u.UserId,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
            IsActive = u.IsActive,
            CreatedDate = u.CreatedDate,
            ManagerId = u.ManagerId
        }).ToList();

        return Ok(result);
    }

    // Manager can view employees (Employee role only) in their managed teams
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployeesInMyTeams()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var currentUserId))
            return Unauthorized();

        var managerTeamIds = await _db.Teams
            .Where(t => t.ManagerId == currentUserId && t.IsActive)
            .Select(t => t.TeamId)
            .ToListAsync();

        if (!managerTeamIds.Any())
            return Ok(new List<object>());

        var employeeUserIds = await _db.Set<TeamMember>()
            .Where(tm => managerTeamIds.Contains(tm.TeamId))
            .Select(tm => tm.UserId)
            .Distinct()
            .ToListAsync();

        var employees = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => employeeUserIds.Contains(u.UserId)
                        && u.IsActive
                        && u.UserId != currentUserId
                        && u.UserRoles.Any(ur => ur.Role.RoleName == "Employee"))
            .OrderBy(u => u.FirstName)
            .Select(u => new UserDto
            {
                Id = u.UserId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
                IsActive = u.IsActive,
                CreatedDate = u.CreatedDate,
                ManagerId = u.ManagerId
            })
            .ToListAsync();

        return Ok(employees);
    }

    // Any authenticated user can view their own profile
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var currentUserId))
                return Unauthorized(new { message = "Could not identify user from token." });

            var user = await _db.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u => u.UserId == currentUserId);

            if (user == null) return NotFound(new { message = "User not found." });

            // Get user's role names
            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            // ── Personal Task Statistics ──────────────────────
            var tasks = await _db.Tasks
                .Where(t => t.AssigneeId == currentUserId)
                .ToListAsync();

            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Status == 3);
            var inProgressTasks = tasks.Count(t => t.Status == 2);
            var pendingTasks = tasks.Count(t => t.Status == 0 || t.Status == 1);
            var overdueTasks = tasks.Count(t =>
                t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3);

            // ── Work Log Hours ────────────────────────────────
            var totalHours = await _db.WorkLogs
                .Where(w => w.UserId == currentUserId)
                .SumAsync(w => (double?)w.TotalHours) ?? 0;

            // ── Leadership Stats ──────────────────────────────
            var directReports = await _db.Users.CountAsync(u => u.ManagerId == currentUserId && u.IsActive);
            var managedTeamsCount = await _db.Teams.CountAsync(t => t.ManagerId == currentUserId && t.IsActive);

            // ── Team Memberships ──────────────────────────────
            var memberships = await _db.TeamMembers
                .Include(tm => tm.Team)
                .Where(tm => tm.UserId == currentUserId)
                .ToListAsync();

            var teams = memberships
                .Select(tm => new ProfileTeamDto
                {
                    TeamId = tm.TeamId,
                    TeamName = tm.Team?.TeamName ?? "Unknown",
                    Role = tm.Team?.ManagerId == currentUserId ? "Manager" : "Member"
                }).ToList();

            // Add managed teams not in memberships
            var managedTeams = await _db.Teams
                .Where(t => t.ManagerId == currentUserId && t.IsActive)
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

            // Build base profile
            var profile = new UserProfileDto
            {
                Id = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsActive = user.IsActive,
                ProfileImageUrl = user.ProfileImageUrl,
                CreatedDate = user.CreatedDate,
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

            // ── Role-Specific Data ────────────────────────────
            bool isAdmin = roles.Contains("Admin");
            bool isManager = roles.Contains("Manager");
            bool isTeamLead = roles.Contains("TeamLead") || roles.Contains("Team Lead");
            bool isEmployee = !isAdmin && !isManager && !isTeamLead;

            // ─────────────────────────────────────────────────
            // ADMIN → Full system-wide overview + team perf
            // ─────────────────────────────────────────────────
            if (isAdmin)
            {
                profile.AllUsersCount = await _db.Users.CountAsync();
                profile.ActiveUsersCount = await _db.Users.CountAsync(u => u.IsActive);
                profile.AllTeamsCount = await _db.Teams.CountAsync(t => t.IsActive);
                profile.AllTasksCount = await _db.Tasks.CountAsync();
                profile.InactiveUsersCount = await _db.Users.CountAsync(u => !u.IsActive);
                profile.TotalCompletedTasksOrg = await _db.Tasks.CountAsync(t => t.Status == 3);

                // Admin also gets team performance if they manage teams
                var managedTeamIds = managedTeams.Select(t => t.TeamId).ToList();
                if (managedTeamIds.Count > 0)
                {
                    await PopulateTeamPerformance(profile, managedTeamIds);
                }
            }

            // ─────────────────────────────────────────────────
            // MANAGER → Team performance & direct reports
            // ─────────────────────────────────────────────────
            if (isManager && !isAdmin)
            {
                var managedTeamIds = managedTeams.Select(t => t.TeamId).ToList();
                if (managedTeamIds.Count > 0)
                {
                    await PopulateTeamPerformance(profile, managedTeamIds);
                }
                else
                {
                    profile.TeamMembersCount = 0;
                    profile.TeamTasksCount = 0;
                    profile.TeamCompletedTasks = 0;
                    profile.TeamCompletionRate = 0;
                    profile.TeamOverdueTasks = 0;
                    profile.TeamHoursLogged = 0;
                }
            }

            // ─────────────────────────────────────────────────
            // TEAM LEAD → Team members & completion
            // ─────────────────────────────────────────────────
            if (isTeamLead && !isManager && !isAdmin)
            {
                var managedTeamIds = managedTeams.Select(t => t.TeamId).ToList();
                // Also include teams where user is a member (TeamLead may not be "manager" of the team in DB)
                var memberTeamIds = memberships.Select(m => m.TeamId).ToList();
                var allTeamIds = managedTeamIds.Union(memberTeamIds).Distinct().ToList();

                if (allTeamIds.Count > 0)
                {
                    await PopulateTeamPerformance(profile, allTeamIds);
                }
                else
                {
                    profile.TeamMembersCount = 0;
                    profile.TeamTasksCount = 0;
                    profile.TeamCompletedTasks = 0;
                    profile.TeamCompletionRate = 0;
                    profile.TeamOverdueTasks = 0;
                    profile.TeamHoursLogged = 0;
                }
            }

            // ─────────────────────────────────────────────────
            // EMPLOYEE → Personal productivity metrics
            // ─────────────────────────────────────────────────
            if (isEmployee)
            {
                // Average hours per day (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var recentLogs = await _db.WorkLogs
                    .Where(w => w.UserId == currentUserId && w.StartTime >= thirtyDaysAgo)
                    .ToListAsync();

                var daysWithLogs = recentLogs.Select(w => w.StartTime.Date).Distinct().Count();
                profile.AvgHoursPerDay = daysWithLogs > 0
                    ? Math.Round(recentLogs.Sum(w => (double)w.TotalHours) / daysWithLogs, 1)
                    : 0;

                // Tasks completed this week
                var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
                profile.TasksCompletedThisWeek = tasks.Count(t =>
                    t.Status == 3 && t.CompletedDate.HasValue && t.CompletedDate.Value >= weekStart);

                // Tasks due this week
                var weekEnd = weekStart.AddDays(7);
                profile.TasksDueThisWeek = tasks.Count(t =>
                    t.Deadline.HasValue && t.Deadline.Value >= weekStart && t.Deadline.Value < weekEnd && t.Status != 3);
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to load profile.", detail = ex.Message });
        }
    }

    // ── Helper: Populate team performance stats ──────
    private async Task PopulateTeamPerformance(UserProfileDto profile, List<int> teamIds)
    {
        var memberCount = await _db.TeamMembers
            .Where(tm => teamIds.Contains(tm.TeamId))
            .Select(tm => tm.UserId)
            .Distinct()
            .CountAsync();

        var teamTasks = await _db.Tasks
            .Where(t => t.TeamId.HasValue && teamIds.Contains(t.TeamId.Value))
            .ToListAsync();

        var teamTasksCount = teamTasks.Count;
        var teamCompleted = teamTasks.Count(t => t.Status == 3);
        var teamOverdue = teamTasks.Count(t =>
            t.Deadline.HasValue && t.Deadline.Value < DateTime.UtcNow && t.Status != 3);

        // Team hours logged
        var memberIds = await _db.TeamMembers
            .Where(tm => teamIds.Contains(tm.TeamId))
            .Select(tm => tm.UserId)
            .Distinct()
            .ToListAsync();

        var teamHours = await _db.WorkLogs
            .Where(w => memberIds.Contains(w.UserId))
            .SumAsync(w => (double?)w.TotalHours) ?? 0;

        profile.TeamMembersCount = memberCount;
        profile.TeamTasksCount = teamTasksCount;
        profile.TeamCompletedTasks = teamCompleted;
        profile.TeamCompletionRate = teamTasksCount > 0
            ? Math.Round((double)teamCompleted / teamTasksCount * 100, 1)
            : 0;
        profile.TeamOverdueTasks = teamOverdue;
        profile.TeamHoursLogged = Math.Round(teamHours, 1);
    }

    // Upload profile avatar
    [HttpPost("me/avatar")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB max
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        try
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var currentUserId))
                return Unauthorized(new { message = "Could not identify user from token." });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest(new { message = "Only jpg, png, gif, webp images are allowed." });

            // Ensure upload directory exists
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(uploadsDir);

            // Generate unique filename
            var fileName = $"{currentUserId}_{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user record
            var user = await _db.Users.FindAsync(currentUserId);
            if (user == null) return NotFound();

            // Delete old avatar file if exists
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot",
                    user.ProfileImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            user.ProfileImageUrl = $"/uploads/avatars/{fileName}";
            user.UpdatedDate = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { profileImageUrl = user.ProfileImageUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to upload avatar.", detail = ex.Message });
        }
    }
}

