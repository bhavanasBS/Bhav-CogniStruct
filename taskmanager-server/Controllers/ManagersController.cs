using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/managers")]
[Authorize(Roles = "Admin,Manager,TeamLead")]
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
            Role = m.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Manager"
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}/dashboard")]
    public async Task<IActionResult> GetDashboard(int id)
    {
        // Get all projects (parent tasks) created by this manager
        var projects = await _db.Tasks
            .Include(t => t.SubTasks).ThenInclude(st => st.WorkLogs)
            .Where(t => t.AssignerId == id && t.ParentTaskId == null)
            .ToListAsync();

        var allSubtasks = projects.SelectMany(p => p.SubTasks).ToList();
        var totalTasks = allSubtasks.Count;
        var completedTasks = allSubtasks.Count(t => t.Status == 3);
        var activeTasks = allSubtasks.Count(t => t.Status != 3);
        var totalHours = allSubtasks.SelectMany(t => t.WorkLogs).Sum(w => w.TotalHours);
        var efficiency = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

        var dashboard = new ManagerDashboardDto
        {
            ActiveTasks = activeTasks,
            TotalHours = Math.Round(totalHours, 1),
            AvgEfficiency = efficiency
        };

        return Ok(dashboard);
    }

    [HttpGet("{id}/hierarchy")]
    public async Task<IActionResult> GetHierarchy(int id)
    {
        var manager = await _db.Users.FindAsync(id);
        if (manager == null) return NotFound();

        // Get projects created by this manager
        var projects = await _db.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.SubTasks).ThenInclude(st => st.Assignee)
                .ThenInclude(a => a!.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.AssignerId == id && t.ParentTaskId == null)
            .ToListAsync();

        var node = new HierarchyNode
        {
            Id = manager.UserId,
            Name = $"{manager.FirstName} {manager.LastName}",
            Role = "Manager",
            Children = projects.Select(p => new HierarchyNode
            {
                Id = p.TaskId,
                Name = p.Title,
                Role = "Project",
                Children = p.SubTasks
                    .Where(st => st.Assignee != null)
                    .Select(st => st.Assignee!)
                    .DistinctBy(a => a.UserId)
                    .Select(a => new HierarchyNode
                    {
                        Id = a.UserId,
                        Name = $"{a.FirstName} {a.LastName}",
                        Role = a.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee"
                    }).ToList()
            }).ToList()
        };

        return Ok(node);
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
    /// Get dashboard for current authenticated team lead
    /// TeamLeads see stats from projects assigned to them
    /// </summary>
    [HttpGet("teamlead-dashboard")]
    public async Task<IActionResult> GetTeamLeadDashboard()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        // Get projects assigned to this team lead
        var projects = await _db.Tasks
            .Include(t => t.SubTasks).ThenInclude(st => st.WorkLogs)
            .Where(t => t.AssigneeId == userId && t.ParentTaskId == null)
            .ToListAsync();

        var allSubtasks = projects.SelectMany(p => p.SubTasks).ToList();
        var totalTasks = allSubtasks.Count;
        var completedTasks = allSubtasks.Count(t => t.Status == 3);
        var activeTasks = allSubtasks.Count(t => t.Status != 3);
        var totalHours = allSubtasks.SelectMany(t => t.WorkLogs).Sum(w => w.TotalHours);
        var efficiency = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

        var dashboard = new ManagerDashboardDto
        {
            ActiveTasks = activeTasks,
            TotalHours = Math.Round(totalHours, 1),
            AvgEfficiency = efficiency
        };

        return Ok(dashboard);
    }

    /// <summary>
    /// Get project members for current authenticated manager
    /// Returns all unique users from subtasks across manager's projects
    /// </summary>
    [HttpGet("my-team")]
    public async Task<IActionResult> GetMyTeam()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        // Get projects created by this manager
        var projects = await _db.Tasks
            .Include(t => t.SubTasks).ThenInclude(st => st.Assignee)
                .ThenInclude(a => a!.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.Assignee)
                .ThenInclude(a => a!.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.AssignerId == userId && t.ParentTaskId == null)
            .ToListAsync();

        var members = projects
            .SelectMany(p =>
            {
                var result = new List<object>();
                // Add project lead
                if (p.Assignee != null)
                {
                    result.Add(new
                    {
                        Id = p.Assignee.UserId,
                        Name = $"{p.Assignee.FirstName} {p.Assignee.LastName}",
                        Email = p.Assignee.Email,
                        Role = p.Assignee.UserRoles.FirstOrDefault()?.Role.RoleName ?? "TeamLead",
                        Project = p.Title,
                        ProjectId = p.TaskId,
                        TasksAssigned = p.SubTasks.Count(st => st.AssigneeId == p.Assignee.UserId),
                        TasksCompleted = p.SubTasks.Count(st => st.AssigneeId == p.Assignee.UserId && st.Status == 3),
                        IsActive = p.Assignee.IsActive
                    });
                }
                // Add subtask assignees
                foreach (var st in p.SubTasks.Where(st => st.Assignee != null))
                {
                    result.Add(new
                    {
                        Id = st.Assignee!.UserId,
                        Name = $"{st.Assignee.FirstName} {st.Assignee.LastName}",
                        Email = st.Assignee.Email,
                        Role = st.Assignee.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                        Project = p.Title,
                        ProjectId = p.TaskId,
                        TasksAssigned = p.SubTasks.Count(t => t.AssigneeId == st.Assignee.UserId),
                        TasksCompleted = p.SubTasks.Count(t => t.AssigneeId == st.Assignee.UserId && t.Status == 3),
                        IsActive = st.Assignee.IsActive
                    });
                }
                return result;
            })
            .GroupBy(m => ((dynamic)m).Id)
            .Select(g => g.First())
            .ToList();

        return Ok(members);
    }

    /// <summary>
    /// Get project members by manager ID
    /// </summary>
    [HttpGet("{id}/team-members")]
    public async Task<IActionResult> GetTeamMembers(int id)
    {
        return await GetMyTeamById(id);
    }

    private async Task<IActionResult> GetMyTeamById(int managerId)
    {
        var projects = await _db.Tasks
            .Include(t => t.SubTasks).ThenInclude(st => st.Assignee)
                .ThenInclude(a => a!.UserRoles).ThenInclude(ur => ur.Role)
            .Include(t => t.Assignee)
                .ThenInclude(a => a!.UserRoles).ThenInclude(ur => ur.Role)
            .Where(t => t.AssignerId == managerId && t.ParentTaskId == null)
            .ToListAsync();

        var allUsers = new Dictionary<int, object>();

        foreach (var p in projects)
        {
            // Add project lead
            if (p.Assignee != null && !allUsers.ContainsKey(p.Assignee.UserId))
            {
                allUsers[p.Assignee.UserId] = new
                {
                    Id = p.Assignee.UserId,
                    Name = $"{p.Assignee.FirstName} {p.Assignee.LastName}",
                    Email = p.Assignee.Email,
                    Role = p.Assignee.UserRoles.FirstOrDefault()?.Role.RoleName ?? "TeamLead",
                    IsActive = p.Assignee.IsActive
                };
            }
            // Add subtask assignees
            foreach (var st in p.SubTasks.Where(st => st.Assignee != null))
            {
                if (!allUsers.ContainsKey(st.Assignee!.UserId))
                {
                    allUsers[st.Assignee.UserId] = new
                    {
                        Id = st.Assignee.UserId,
                        Name = $"{st.Assignee.FirstName} {st.Assignee.LastName}",
                        Email = st.Assignee.Email,
                        Role = st.Assignee.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                        IsActive = st.Assignee.IsActive
                    };
                }
            }
        }

        return Ok(allUsers.Values.ToList());
    }
}
