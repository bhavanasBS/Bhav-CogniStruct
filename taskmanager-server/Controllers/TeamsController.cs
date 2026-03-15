using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeamsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? User.FindFirst("sub")
                    ?? User.FindFirst("userId")
                    ?? User.FindFirst("UserId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    // ─── List Teams ─────────────────────────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var query = _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .Include(t => t.Projects)
            .AsQueryable();

        // Non-admin users only see their own teams
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId > 0)
                query = query.Where(t => t.ManagerId == currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.TeamName.Contains(search));

        var teams = await query.OrderBy(t => t.TeamName).ToListAsync();

        return Ok(teams.Select(MapToDto));
    }

    // ─── My Teams (for team members) ────────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead,Employee")]
    [HttpGet("my-team")]
    public async Task<IActionResult> GetMyTeam()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        var teamIds = await _db.TeamMembers
            .Where(m => m.UserId == currentUserId)
            .Select(m => m.TeamId)
            .ToListAsync();

        var teams = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .Include(t => t.Projects)
            .Where(t => teamIds.Contains(t.TeamId))
            .OrderBy(t => t.TeamName)
            .ToListAsync();

        return Ok(teams.Select(MapToDto));
    }

    // ─── Get Team by ID ─────────────────────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.Projects)
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

    // ─── Create Team ────────────────────────────────────
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TeamName))
            return BadRequest(new { message = "Team name is required." });

        // If a Manager is creating a team, auto-assign themselves
        var managerId = request.ManagerId;
        if (!managerId.HasValue)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId > 0)
                managerId = currentUserId;
        }

        var team = new Team
        {
            TeamName = request.TeamName.Trim(),
            Description = request.Description?.Trim(),
            ManagerId = managerId,
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };

        _db.Teams.Add(team);
        await _db.SaveChangesAsync();

        // Add manager as member automatically
        if (managerId.HasValue)
        {
            var alreadyMember = await _db.TeamMembers
                .AnyAsync(m => m.TeamId == team.TeamId && m.UserId == managerId.Value);
            if (!alreadyMember)
            {
                _db.TeamMembers.Add(new TeamMember
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

    // ─── Update Team ────────────────────────────────────
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamRequest request)
    {
        var team = await _db.Teams.FindAsync(id);
        if (team == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.TeamName))
            team.TeamName = request.TeamName.Trim();

        if (request.Description != null)
            team.Description = request.Description.Trim();

        if (request.ManagerId.HasValue)
            team.ManagerId = request.ManagerId.Value;

        if (request.IsActive.HasValue)
            team.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Team updated." });
    }

    // ─── Delete Team ────────────────────────────────────
    // Block deletion if the team has projects assigned to it
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var team = await _db.Teams
            .Include(t => t.Projects)
            .FirstOrDefaultAsync(t => t.TeamId == id);

        if (team == null) return NotFound();

        // Block if team has projects
        if (team.Projects.Any())
            return BadRequest(new { message = $"Cannot delete team '{team.TeamName}' because it has {team.Projects.Count} project(s) assigned. Please reassign or remove projects first." });

        _db.Teams.Remove(team);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Team deleted." });
    }

    // ─── Get Team Members ───────────────────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("{teamId}/members")]
    public async Task<IActionResult> GetMembers(int teamId)
    {
        var members = await _db.TeamMembers
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

    // ─── Add Member to Team ─────────────────────────────
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("{teamId}/members")]
    public async Task<IActionResult> AddMember(int teamId, [FromBody] AddMemberRequest request)
    {
        var teamExists = await _db.Teams.AnyAsync(t => t.TeamId == teamId);
        if (!teamExists) return NotFound(new { message = "Team not found." });

        var exists = await _db.TeamMembers
            .AnyAsync(m => m.TeamId == teamId && m.UserId == request.UserId);

        if (exists)
            return BadRequest(new { message = "User is already a member of this team." });

        _db.TeamMembers.Add(new TeamMember
        {
            TeamId = teamId,
            UserId = request.UserId,
            JoinedDate = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Member added." });
    }

    // ─── Remove Member from Team ────────────────────────
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{teamId}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(int teamId, int userId)
    {
        var member = await _db.TeamMembers
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);

        if (member == null) return NotFound();

        _db.TeamMembers.Remove(member);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Member removed." });
    }

    // ─── Available Users (not in any team, Employees/TeamLeads only) ──
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("{teamId}/available-users")]
    public async Task<IActionResult> GetAvailableUsers(int teamId, [FromQuery] string? search)
    {
        // Rule 2: Exclude users already assigned to ANY team
        var allTeamMemberIds = await _db.TeamMembers
            .Select(m => m.UserId)
            .Distinct()
            .ToListAsync();

        // Rule 1: Only show Employee and TeamLead roles
        var allowedRoles = new[] { "Employee", "TeamLead", "Team Lead" };

        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && !allTeamMemberIds.Contains(u.UserId))
            .Where(u => u.UserRoles.Any(ur => allowedRoles.Contains(ur.Role.RoleName)));

        // Non-admin managers only see their subordinates
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId > 0)
                query = query.Where(u => u.ManagerId == currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                u.FirstName.Contains(search) ||
                u.LastName.Contains(search) ||
                u.Email.Contains(search));

        var users = await query.OrderBy(u => u.FirstName).Take(50).ToListAsync();

        var result = users.Select(u => new
        {
            userId = u.UserId,
            name = $"{u.FirstName} {u.LastName}",
            email = u.Email,
            role = u.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee"
        });

        return Ok(result);
    }

    // ─── Full Organization Hierarchy ────────────────────
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetFullHierarchy()
    {
        var teams = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.IsActive)
            .ToListAsync();

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

        if (admins.Count == 1 && root.Children.Count > 0)
        {
            var admin = admins.First();
            root.Id = admin.UserId;
            root.Name = $"{admin.FirstName} {admin.LastName}";
            root.Role = "Admin";
        }

        return Ok(root);
    }

    private static TeamDto MapToDto(Team t) => new()
    {
        Id = t.TeamId,
        TeamName = t.TeamName,
        Description = t.Description,
        ManagerId = t.ManagerId,
        ManagerName = t.Manager != null ? $"{t.Manager.FirstName} {t.Manager.LastName}" : null,
        MemberCount = t.Members.Count,
        ProjectCount = t.Projects.Count,
        IsActive = t.IsActive,
        CreatedDate = t.CreatedDate
    };
}
