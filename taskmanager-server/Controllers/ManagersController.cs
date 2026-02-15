using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/managers")]
[Authorize(Roles = "Admin,Manager,TeamLead")]  // Admin, Manager, and TeamLead can access
public class ManagersController : ControllerBase
{
    private readonly AppDbContext _db;

    public ManagersController(AppDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                          ?? User.FindFirst("sub")
                          ?? User.FindFirst("userId");
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var managerRoles = new[] { "Manager", "Admin", "Team Lead" };

        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(u => u.ManagedTeams).ThenInclude(t => t.Members)
            .Where(u => u.UserRoles.Any(ur => managerRoles.Contains(ur.Role.RoleName)));

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(u =>
                u.FirstName.Contains(q) ||
                u.LastName.Contains(q) ||
                u.Email.Contains(q));

        var managers = await query.ToListAsync();

        var result = managers.Select(m => new ManagerDto
        {
            Id = m.UserId,
            Name = $"{m.FirstName} {m.LastName}",
            Email = m.Email,
            Department = m.ManagedTeams.FirstOrDefault()?.TeamName ?? "General",
            Role = m.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Manager",
            TeamSize = m.ManagedTeams.SelectMany(t => t.Members).Select(mb => mb.UserId).Distinct().Count(),
            Teams = m.ManagedTeams.Select(t => t.TeamName).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}/dashboard")]
    public async Task<IActionResult> GetDashboard(int id)
    {
        var teams = await _db.Teams
            .Include(t => t.Manager)
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Include(t => t.Tasks).ThenInclude(tk => tk.WorkLogs)
            .Where(t => t.ManagerId == id)
            .ToListAsync();

        var teamReports = teams.Select(t =>
        {
            var totalTasks = t.Tasks.Count;
            var completedTasks = t.Tasks.Count(tk => tk.Status == 3);
            var activeTasks = t.Tasks.Count(tk => tk.Status != 3);
            var totalHours = t.Tasks.SelectMany(tk => tk.WorkLogs).Sum(w => w.TotalHours);
            var efficiency = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

            return new TeamReportDto
            {
                Id = t.TeamId,
                Name = t.TeamName,
                Lead = t.Manager != null ? $"{t.Manager.FirstName} {t.Manager.LastName}" : "Unassigned",
                Members = t.Members.Count,
                ActiveTasks = activeTasks,
                CompletedTasks = completedTasks,
                TotalHours = Math.Round(totalHours, 1),
                Efficiency = efficiency,
                Status = efficiency >= 70 ? "on-track" : efficiency >= 40 ? "at-risk" : "behind"
            };
        }).ToList();

        var dashboard = new ManagerDashboardDto
        {
            TeamReports = teamReports,
            TotalTeams = teams.Count,
            ActiveTasks = teamReports.Sum(r => r.ActiveTasks),
            TotalHours = Math.Round(teamReports.Sum(r => r.TotalHours), 1),
            AvgEfficiency = teamReports.Any()
                ? Math.Round(teamReports.Average(r => r.Efficiency), 1)
                : 0
        };

        return Ok(dashboard);
    }

    [HttpGet("{id}/hierarchy")]
    public async Task<IActionResult> GetHierarchy(int id)
    {
        var manager = await _db.Users.FindAsync(id);
        if (manager == null) return NotFound();

        var teams = await _db.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.ManagerId == id)
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
                    Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee"
                }).ToList()
            }).ToList()
        };

        return Ok(node);
    }

    [HttpGet("{id}/team-report")]
    public async Task<IActionResult> GetTeamReport(int id)
    {
        var teams = await _db.Teams
            .Include(t => t.Members)
            .Include(t => t.Tasks).ThenInclude(tk => tk.WorkLogs)
            .Where(t => t.ManagerId == id)
            .ToListAsync();

        var reports = teams.Select(t =>
        {
            var totalTasks = t.Tasks.Count;
            var completedTasks = t.Tasks.Count(tk => tk.Status == 3);
            var activeTasks = t.Tasks.Count(tk => tk.Status != 3);
            var totalHours = t.Tasks.SelectMany(tk => tk.WorkLogs).Sum(w => w.TotalHours);
            var efficiency = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

            return new TeamReportDto
            {
                Id = t.TeamId,
                Name = t.TeamName,
                Lead = "Manager",
                Members = t.Members.Count,
                ActiveTasks = activeTasks,
                CompletedTasks = completedTasks,
                TotalHours = Math.Round(totalHours, 1),
                Efficiency = efficiency,
                Status = efficiency >= 70 ? "on-track" : efficiency >= 40 ? "at-risk" : "behind"
            };
        }).ToList();

        return Ok(reports);
    }

    /// <summary>
    /// Get dashboard for current authenticated manager
    /// </summary>
    [HttpGet("my-dashboard")]
    public async Task<IActionResult> GetMyDashboard()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();
        return await GetDashboard(userId);
    }

    /// <summary>
    /// Get team members for current authenticated manager
    /// </summary>
    [HttpGet("my-team")]
    public async Task<IActionResult> GetMyTeam()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var teams = await _db.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.Tasks)
            .Where(t => t.ManagerId == userId)
            .ToListAsync();

        var members = teams
            .SelectMany(t => t.Members.Select(m => new
            {
                Id = m.UserId,
                Name = $"{m.User.FirstName} {m.User.LastName}",
                Email = m.User.Email,
                Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                Team = t.TeamName,
                TeamId = t.TeamId,
                TasksAssigned = t.Tasks.Count(tk => tk.AssigneeId == m.UserId),
                TasksCompleted = t.Tasks.Count(tk => tk.AssigneeId == m.UserId && tk.Status == 3),
                IsActive = m.User.IsActive
            }))
            .GroupBy(m => m.Id)
            .Select(g => g.First())
            .ToList();

        return Ok(members);
    }

    /// <summary>
    /// Get team members by manager ID
    /// </summary>
    [HttpGet("{id}/team-members")]
    public async Task<IActionResult> GetTeamMembers(int id)
    {
        var teams = await _db.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.Tasks)
            .Where(t => t.ManagerId == id)
            .ToListAsync();

        var members = teams
            .SelectMany(t => t.Members.Select(m => new
            {
                Id = m.UserId,
                Name = $"{m.User.FirstName} {m.User.LastName}",
                Email = m.User.Email,
                Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                Team = t.TeamName,
                TeamId = t.TeamId,
                TasksAssigned = t.Tasks.Count(tk => tk.AssigneeId == m.UserId),
                TasksCompleted = t.Tasks.Count(tk => tk.AssigneeId == m.UserId && tk.Status == 3),
                IsActive = m.User.IsActive
            }))
            .GroupBy(m => m.Id)
            .Select(g => g.First())
            .ToList();

        return Ok(members);
    }
}
