using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]  // Base auth required
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeamsController(AppDbContext db)
    {
        _db = db;
    }

    // Admin, Manager, TeamLead can view teams
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var query = _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .AsQueryable();

        // Role-based filtering
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
            {
                if (User.IsInRole("Manager"))
                {
                    // Manager sees teams they manage
                    query = query.Where(t => t.ManagerId == currentUserId);
                }
                else
                {
                    // TeamLead sees teams where they are a member
                    query = query.Where(t => t.Members.Any(m => m.UserId == currentUserId));
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.TeamName.Contains(search));

        var teams = await query.OrderBy(t => t.TeamName).ToListAsync();

        return Ok(teams.Select(MapToDto));
    }

    // TeamLead/Employee can view teams they are a member of
    [Authorize(Roles = "Admin,Manager,TeamLead,Employee")]
    [HttpGet("my-team")]
    public async Task<IActionResult> GetMyTeam()
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var currentUserId))
            return Unauthorized();

        var teamIds = await _db.Set<TeamMember>()
            .Where(m => m.UserId == currentUserId)
            .Select(m => m.TeamId)
            .ToListAsync();

        var teams = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .Where(t => teamIds.Contains(t.TeamId))
            .OrderBy(t => t.TeamName)
            .ToListAsync();

        return Ok(teams.Select(MapToDto));
    }

    // Admin, Manager, TeamLead can view team details
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(t => t.TeamId == id);

        if (team == null) return NotFound();

        var dto = MapToDto(team);
        dto.Members = team.Members.Select(m => new TeamMemberDto
        {
            UserId = m.UserId,
            Name = $"{m.User.FirstName} {m.User.LastName}",
            Email = m.User.Email,
            Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
            JoinedDate = m.JoinedDate
        }).ToList();

        return Ok(dto);
    }

    // Admin and Manager can create teams
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamRequest request)
    {
        // If a Manager is creating a team, auto-assign themselves as manager if not specified
        var managerId = request.ManagerId;
        if (!managerId.HasValue)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
                managerId = currentUserId;
        }

        var team = new Team
        {
            TeamName = request.TeamName,
            Description = request.Description ?? string.Empty,
            ManagerId = managerId,
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };

        _db.Teams.Add(team);
        await _db.SaveChangesAsync();

        // Add manager as member if specified
        if (managerId.HasValue)
        {
            var alreadyMember = await _db.Set<TeamMember>()
                .AnyAsync(m => m.TeamId == team.TeamId && m.UserId == managerId.Value);
            if (!alreadyMember)
            {
                _db.Set<TeamMember>().Add(new TeamMember
                {
                    TeamId = team.TeamId,
                    UserId = managerId.Value,
                    JoinedDate = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
        }

        return CreatedAtAction(nameof(GetById), new { id = team.TeamId }, new { team.TeamId, team.TeamName });
    }

    // Admin and Manager can update teams
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamRequest request)
    {
        var team = await _db.Teams.FindAsync(id);
        if (team == null) return NotFound();

        team.TeamName = request.TeamName ?? team.TeamName;
        team.Description = request.Description ?? team.Description;
        team.ManagerId = request.ManagerId ?? team.ManagerId;
        team.IsActive = request.IsActive ?? team.IsActive;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Team updated." });
    }

    // Only Admin can delete teams
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.TeamId == id);
        if (team == null) return NotFound();

        try
        {
            // Remove all team members first
            var members = await _db.Set<TeamMember>()
                .Where(m => m.TeamId == id)
                .ToListAsync();
            if (members.Any())
                _db.Set<TeamMember>().RemoveRange(members);

            // Nullify TeamId on tasks that reference this team
            var tasks = await _db.Tasks
                .Where(t => t.TeamId == id)
                .ToListAsync();
            foreach (var task in tasks)
                task.TeamId = null;

            _db.Teams.Remove(team);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Team deleted." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to delete team: {ex.InnerException?.Message ?? ex.Message}" });
        }
    }

    // ─── Members ────────────────────────────────────

    // Admin, Manager, TeamLead can view members
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("{teamId}/members")]
    public async Task<IActionResult> GetMembers(int teamId)
    {
        // Validate Manager ownership
        if (User.IsInRole("Manager") && !User.IsInRole("Admin"))
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
            {
                var team = await _db.Teams.FindAsync(teamId);
                if (team == null) return NotFound();
                if (team.ManagerId != currentUserId)
                    return StatusCode(403, new { message = "You can only view members of teams you manage." });
            }
        }

        var members = await _db.Set<TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ToListAsync();

        var result = members.Select(m => new TeamMemberDto
        {
            UserId = m.UserId,
            Name = $"{m.User.FirstName} {m.User.LastName}",
            Email = m.User.Email,
            Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
            JoinedDate = m.JoinedDate
        });

        return Ok(result);
    }

    // Admin and Manager can add members
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("{teamId}/members")]
    public async Task<IActionResult> AddMember(int teamId, [FromBody] AddMemberRequest request)
    {
        // Validate: only Employee and TeamLead can be added to teams
        var targetUser = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == request.UserId);

        if (targetUser == null)
            return NotFound(new { message = "User not found." });

        var userRoles = targetUser.UserRoles.Select(ur => ur.Role.RoleName).ToList();
        if (userRoles.Contains("Admin") || userRoles.Contains("Manager"))
            return BadRequest(new { message = "Admin and Manager roles cannot be added to a team." });

        var exists = await _db.Set<TeamMember>()
            .AnyAsync(m => m.TeamId == teamId && m.UserId == request.UserId);

        if (exists)
            return BadRequest(new { message = "User is already a member of this team." });

        _db.Set<TeamMember>().Add(new TeamMember
        {
            TeamId = teamId,
            UserId = request.UserId,
            JoinedDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Member added." });
    }

    // Admin and Manager can remove members
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{teamId}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(int teamId, int userId)
    {
        var member = await _db.Set<TeamMember>()
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

        if (member == null) return NotFound();

        // Guard: cannot remove member with active subtasks
        var activeSubtasks = await _db.Tasks
            .AnyAsync(t => t.AssigneeId == userId
                        && t.TeamId == teamId
                        && t.ParentTaskId != null
                        && t.Status != 3); // Not completed
        if (activeSubtasks)
            return BadRequest(new { message = "Cannot remove member with active tasks." });

        _db.Set<TeamMember>().Remove(member);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Member removed." });
    }

    // ─── Hierarchy ──────────────────────────────────

    // ─── Full Organization Hierarchy ─────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetFullHierarchy()
    {
        // Get all teams with members
        var teams = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.IsActive)
            .ToListAsync();

        // Find admin users to use as root
        var admins = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == "Admin"))
            .ToListAsync();

        var root = new HierarchyNode
        {
            Id = 0,
            Name = "Organization",
            Role = "Organization",
            Children = new List<HierarchyNode>()
        };

        // Group teams by manager
        var managerTeams = teams.GroupBy(t => t.ManagerId).ToList();

        foreach (var group in managerTeams)
        {
            var manager = group.First().Manager;
            if (manager == null) continue;

            var managerNode = new HierarchyNode
            {
                Id = manager.UserId,
                Name = $"{manager.FirstName} {manager.LastName}",
                Role = "Manager",
                Children = group.Select(t => new HierarchyNode
                {
                    Id = t.TeamId,
                    Name = t.TeamName,
                    Role = "Team",
                    Children = t.Members
                        .Where(m => m.UserId != manager.UserId)
                        .Select(m => new HierarchyNode
                        {
                            Id = m.UserId,
                            Name = $"{m.User.FirstName} {m.User.LastName}",
                            Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee"
                        }).ToList()
                }).ToList()
            };

            root.Children.Add(managerNode);
        }

        // If there's only one admin/root, use them as root directly
        if (admins.Count == 1 && root.Children.Count > 0)
        {
            var admin = admins.First();
            root.Id = admin.UserId;
            root.Name = $"{admin.FirstName} {admin.LastName}";
            root.Role = "Admin";
        }

        return Ok(root);
    }

    [HttpGet("hierarchy/{managerId}")]
    public async Task<IActionResult> GetHierarchy(int managerId)
    {
        var manager = await _db.Users.FindAsync(managerId);
        if (manager == null) return NotFound();

        var teams = await _db.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Where(t => t.ManagerId == managerId)
            .ToListAsync();

        var node = new HierarchyNode
        {
            Id = manager.UserId,
            Name = $"{manager.FirstName} {manager.LastName}",
            Role = "Manager",
            Children = teams.Select(t => new HierarchyNode
            {
                Id = t.TeamId,
                Name = t.TeamName,
                Role = "Team",
                Children = t.Members.Select(m => new HierarchyNode
                {
                    Id = m.UserId,
                    Name = $"{m.User.FirstName} {m.User.LastName}",
                    Role = "Member"
                }).ToList()
            }).ToList()
        };

        return Ok(node);
    }

    // ─── Manager Search ─────────────────────────────

    [HttpGet("manager-search")]
    public async Task<IActionResult> SearchManagers([FromQuery] string? q)
    {
        var managerRoles = new[] { "Manager", "Admin", "Team Lead" };

        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => managerRoles.Contains(ur.Role.RoleName)));

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(u =>
                u.FirstName.Contains(q) ||
                u.LastName.Contains(q) ||
                u.Email.Contains(q));

        var users = await query.ToListAsync();

        var result = users.Select(u => new
        {
            id = u.UserId,
            name = $"{u.FirstName} {u.LastName}",
            email = u.Email,
            role = u.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Manager"
        });

        return Ok(result);
    }

    // Manager can list available users to add to a team
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("{teamId}/available-users")]
    public async Task<IActionResult> GetAvailableUsers(int teamId, [FromQuery] string? search)
    {
        var existingMemberIds = await _db.Set<TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Select(m => m.UserId)
            .ToListAsync();

        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && !existingMemberIds.Contains(u.UserId));

        // If the current user is a Manager (not Admin), only show their subordinates
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var currentUserId))
            {
                query = query.Where(u => u.ManagerId == currentUserId);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                u.FirstName.Contains(search) ||
                u.LastName.Contains(search) ||
                u.Email.Contains(search));

        var users = await query.OrderBy(u => u.FirstName).Take(20).ToListAsync();

        var result = users.Select(u => new
        {
            userId = u.UserId,
            name = $"{u.FirstName} {u.LastName}",
            email = u.Email,
            role = u.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee"
        });

        return Ok(result);
    }

    private static TeamDto MapToDto(Team t) => new()
    {
        Id = t.TeamId,
        TeamName = t.TeamName,
        Description = t.Description,
        ManagerId = t.ManagerId,
        ManagerName = t.Manager != null ? $"{t.Manager.FirstName} {t.Manager.LastName}" : null,
        MemberCount = t.Members.Count,
        IsActive = t.IsActive,
        CreatedDate = t.CreatedDate
    };
}
