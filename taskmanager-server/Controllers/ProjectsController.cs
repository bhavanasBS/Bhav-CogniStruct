using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize(Roles = "Admin,Manager,TeamLead")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProjectsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                    ?? User.FindFirst("sub")
                    ?? User.FindFirst("userId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    /// <summary>
    /// GET /api/projects — Return projects based on current user's role:
    ///   Admin: all projects
    ///   Manager: projects created by the current manager
    ///   TeamLead / Employee: projects where user is a ProjectMember
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var query = _db.Projects
            .Include(p => p.CreatedByManager)
            .Include(p => p.Lead)
            .Include(p => p.Team)
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .AsQueryable();

        if (User.IsInRole("Admin"))
        {
            // Admin sees all projects
        }
        else if (User.IsInRole("Manager"))
        {
            // Manager sees projects they created
            query = query.Where(p => p.CreatedByManagerId == userId);
        }
        else
        {
            // TeamLead / Employee sees projects where they are a member
            query = query.Where(p => p.Members.Any(m => m.UserId == userId));
        }

        var projects = await query
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync();

        var result = projects.Select(MapToDto).ToList();
        return Ok(result);
    }

    /// <summary>
    /// GET /api/projects/{id} — Return project details with members and tasks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _db.Projects
            .Include(p => p.CreatedByManager)
            .Include(p => p.Lead)
            .Include(p => p.Team)
            .Include(p => p.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u!.UserRoles).ThenInclude(ur => ur.Role)
            .Include(p => p.Tasks).ThenInclude(t => t.Assignee)
            .Include(p => p.Tasks).ThenInclude(t => t.SubTasks)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null) return NotFound();

        var dto = MapToDto(project);

        // Return enriched detail with embedded members and tasks
        return Ok(new
        {
            dto.ProjectId,
            dto.Name,
            dto.Description,
            dto.CreatedByManagerId,
            dto.ManagerName,
            dto.LeadId,
            dto.LeadName,
            dto.TeamId,
            dto.TeamName,
            dto.Status,
            dto.CreatedDate,
            dto.MemberCount,
            dto.TaskCount,
            dto.CompletedTaskCount,
            Members = project.Members.Select(m => new
            {
                UserId = m.UserId,
                Name = $"{m.User.FirstName} {m.User.LastName}",
                Email = m.User.Email,
                Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                IsLead = m.UserId == project.LeadId
            }),
            Tasks = project.Tasks.Where(t => t.ParentTaskId == null || t.ProjectId == id).Select(t => new
            {
                TaskId = t.TaskId,
                Title = t.Title,
                Description = t.Description,
                AssigneeId = t.AssigneeId,
                AssigneeName = t.Assignee != null ? $"{t.Assignee.FirstName} {t.Assignee.LastName}" : null,
                Priority = t.Priority,
                Status = t.Status,
                Deadline = t.Deadline,
                EstimatedHours = t.EstimatedHours,
                CreatedDate = t.CreatedDate,
                SubTaskCount = t.SubTasks?.Count ?? 0,
                CompletedSubTaskCount = t.SubTasks?.Count(st => st.Status == 3) ?? 0
            })
        });
    }

    /// <summary>
    /// POST /api/projects — Create a new project
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest req)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Project name is required." });

        // Team is required
        if (!req.TeamId.HasValue)
            return BadRequest(new { message = "A team must be selected for the project." });

        var teamExists = await _db.Teams.AnyAsync(t => t.TeamId == req.TeamId.Value);
        if (!teamExists)
            return BadRequest(new { message = "Selected team does not exist." });

        // At least one member required
        if (req.MemberUserIds == null || !req.MemberUserIds.Any())
            return BadRequest(new { message = "At least one project member must be selected." });

        // Validate all selected members belong to the team
        var teamMemberIds = await _db.TeamMembers
            .Where(tm => tm.TeamId == req.TeamId.Value)
            .Select(tm => tm.UserId)
            .ToListAsync();
        var teamMemberSet = teamMemberIds.ToHashSet();

        var invalidMembers = req.MemberUserIds.Where(id => !teamMemberSet.Contains(id)).ToList();
        if (invalidMembers.Any())
            return BadRequest(new { message = $"The following user(s) are not members of the selected team: {string.Join(", ", invalidMembers)}" });

        // Team Lead is required and must be one of the selected project members
        if (!req.LeadId.HasValue)
            return BadRequest(new { message = "A Team Lead must be selected." });

        if (!req.MemberUserIds.Contains(req.LeadId.Value))
            return BadRequest(new { message = "Team Lead must be one of the selected project members." });

        // Rule 3 & 4: Team Lead must have TeamLead role
        var leadUser = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == req.LeadId.Value);
        if (leadUser == null)
            return BadRequest(new { message = "Selected Team Lead user does not exist." });

        var isTeamLead = leadUser.UserRoles.Any(ur =>
            ur.Role.RoleName == "TeamLead" || ur.Role.RoleName == "Team Lead");
        if (!isTeamLead)
            return BadRequest(new { message = "Selected user is not a valid Team Lead for this project. Only users with the TeamLead role can be assigned as Team Lead." });

        var project = new Project
        {
            Name = req.Name.Trim(),
            Description = req.Description?.Trim(),
            CreatedByManagerId = userId,
            LeadId = req.LeadId,
            TeamId = req.TeamId,
            Status = 0,
            CreatedDate = DateTime.UtcNow
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        // Add only the explicitly selected members
        var addedUserIds = new HashSet<int>();
        foreach (var memberId in req.MemberUserIds)
        {
            if (addedUserIds.Add(memberId))
            {
                _db.ProjectMembers.Add(new ProjectMember
                {
                    ProjectId = project.ProjectId,
                    UserId = memberId,
                    JoinedDate = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();

        // Create a linked TaskItem so the TeamLead sees this project in their task list
        var projectTask = new TaskItem
        {
            Title = project.Name,
            Description = project.Description,
            AssigneeId = req.LeadId.Value,       // Assigned to Team Lead
            AssignerId = userId,                  // Created by Manager
            Priority = 1,                         // Medium
            Status = 1,                           // Assigned
            ProjectId = project.ProjectId,
            ParentTaskId = null,                  // Top-level = "project"
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };
        _db.Tasks.Add(projectTask);
        await _db.SaveChangesAsync();

        // Reload with includes for DTO
        var created = await _db.Projects
            .Include(p => p.CreatedByManager)
            .Include(p => p.Lead)
            .Include(p => p.Team)
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstAsync(p => p.ProjectId == project.ProjectId);

        return CreatedAtAction(nameof(GetById), new { id = project.ProjectId }, MapToDto(created));
    }

    /// <summary>
    /// PUT /api/projects/{id} — Update project name/description/lead/status
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequest req)
    {
        var project = await _db.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(req.Name))
            project.Name = req.Name.Trim();

        if (req.Description != null)
            project.Description = req.Description.Trim();

        if (req.LeadId.HasValue)
        {
            project.LeadId = req.LeadId.Value;
            // Add lead as member if not already
            if (!project.Members.Any(m => m.UserId == req.LeadId.Value))
            {
                _db.ProjectMembers.Add(new ProjectMember
                {
                    ProjectId = id,
                    UserId = req.LeadId.Value,
                    JoinedDate = DateTime.UtcNow
                });
            }
        }

        if (req.Status.HasValue)
            project.Status = req.Status.Value;

        await _db.SaveChangesAsync();

        // Reload with includes
        var updated = await _db.Projects
            .Include(p => p.CreatedByManager)
            .Include(p => p.Lead)
            .Include(p => p.Team)
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstAsync(p => p.ProjectId == id);

        return Ok(MapToDto(updated));
    }

    /// <summary>
    /// GET /api/projects/{id}/members — List project members with roles
    /// </summary>
    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(int id)
    {
        var project = await _db.Projects
            .Include(p => p.Members).ThenInclude(m => m.User)
                .ThenInclude(u => u!.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null) return NotFound();

        var members = project.Members.Select(m => new ProjectMemberDto
        {
            UserId = m.UserId,
            Name = m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "Unknown",
            Email = m.User?.Email ?? "",
            Role = m.User?.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
            IsLead = project.LeadId == m.UserId,
            JoinedDate = m.JoinedDate
        }).OrderByDescending(m => m.IsLead).ThenBy(m => m.Name).ToList();

        return Ok(members);
    }

    /// <summary>
    /// POST /api/projects/{id}/members — Add user(s) to project
    /// </summary>
    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMembers(int id, [FromBody] AddMembersRequest req)
    {
        var project = await _db.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null) return NotFound();

        if (req.UserIds == null || !req.UserIds.Any())
            return BadRequest(new { message = "At least one userId is required." });

        // Validate members belong to the project's team
        if (project.TeamId.HasValue)
        {
            var teamMemberIdsList = await _db.TeamMembers
                .Where(tm => tm.TeamId == project.TeamId.Value)
                .Select(tm => tm.UserId)
                .ToListAsync();
            var teamMemberIds = teamMemberIdsList.ToHashSet();

            var invalid = req.UserIds.Where(id => !teamMemberIds.Contains(id)).ToList();
            if (invalid.Any())
                return BadRequest(new { message = $"User(s) {string.Join(", ", invalid)} do not belong to the project's team." });
        }

        var existingIds = project.Members.Select(m => m.UserId).ToHashSet();
        var newIds = req.UserIds.Where(uid => !existingIds.Contains(uid)).ToList();

        foreach (var uid in newIds)
        {
            _db.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = id,
                UserId = uid,
                JoinedDate = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { added = newIds.Count, message = $"{newIds.Count} member(s) added." });
    }

    /// <summary>
    /// DELETE /api/projects/{id}/members/{userId} — Remove member from project
    /// </summary>
    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(int id, int userId)
    {
        var member = await _db.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.UserId == userId);

        if (member == null)
            return NotFound(new { message = "Member not found in project." });

        _db.ProjectMembers.Remove(member);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Member removed." });
    }

    /// <summary>
    /// GET /api/projects/{id}/eligible-employees — Employees not already in the project
    /// </summary>
    [HttpGet("{id}/eligible-employees")]
    public async Task<IActionResult> GetEligibleEmployees(int id)
    {
        var project = await _db.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null) return NotFound();

        var existingIds = project.Members.Select(m => m.UserId).ToHashSet();
        var employeeRoles = new[] { "Employee", "TeamLead" };

        var eligible = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive &&
                         u.UserRoles.Any(ur => employeeRoles.Contains(ur.Role.RoleName)) &&
                         !existingIds.Contains(u.UserId))
            .Select(u => new
            {
                u.UserId,
                Name = u.FirstName + " " + u.LastName,
                u.Email,
                Role = u.UserRoles.FirstOrDefault()!.Role.RoleName
            })
            .ToListAsync();

        return Ok(eligible);
    }

    private static ProjectDto MapToDto(Project p)
    {
        return new ProjectDto
        {
            ProjectId = p.ProjectId,
            Name = p.Name,
            Description = p.Description,
            CreatedByManagerId = p.CreatedByManagerId,
            ManagerName = p.CreatedByManager != null
                ? $"{p.CreatedByManager.FirstName} {p.CreatedByManager.LastName}" : null,
            LeadId = p.LeadId,
            LeadName = p.Lead != null
                ? $"{p.Lead.FirstName} {p.Lead.LastName}" : null,
            TeamId = p.TeamId,
            TeamName = p.Team?.TeamName,
            Status = p.Status,
            CreatedDate = p.CreatedDate,
            MemberCount = p.Members.Count,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.Status == 3)
        };
    }
}
