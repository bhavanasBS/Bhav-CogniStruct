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

    // Admin, Manager, TeamLead, HR can view teams
    [Authorize(Roles = "Admin,Manager,TeamLead,HR")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var query = _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.TeamName.Contains(search));

        var teams = await query.OrderBy(t => t.TeamName).ToListAsync();

        return Ok(teams.Select(MapToDto));
    }

    // Admin, Manager, TeamLead, HR can view team details
    [Authorize(Roles = "Admin,Manager,TeamLead,HR")]
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

    // Only Admin can create teams
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamRequest request)
    {
        var team = new Team
        {
            TeamName = request.TeamName,
            Description = request.Description ?? string.Empty,
            ManagerId = request.ManagerId,
            IsActive = true,
            CreatedDate = DateTime.UtcNow
        };

        _db.Teams.Add(team);
        await _db.SaveChangesAsync();

        // Add manager as member if specified
        if (request.ManagerId.HasValue)
        {
            _db.Set<TeamMember>().Add(new TeamMember
            {
                TeamId = team.TeamId,
                UserId = request.ManagerId.Value,
                JoinedDate = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
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
        var team = await _db.Teams.FindAsync(id);
        if (team == null) return NotFound();

        _db.Teams.Remove(team);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Team deleted." });
    }

    // ─── Members ────────────────────────────────────

    // Admin, Manager, TeamLead can view members
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    [HttpGet("{teamId}/members")]
    public async Task<IActionResult> GetMembers(int teamId)
    {
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

        _db.Set<TeamMember>().Remove(member);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Member removed." });
    }

    // ─── Hierarchy ──────────────────────────────────

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
