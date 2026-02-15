using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/workload")]
[Authorize(Roles = "Admin,Manager,HR")]  // Admin, Manager, HR can view workload
public class WorkloadController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkloadController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(int teamId)
    {
        var members = await _db.Set<Models.TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User)
                .ThenInclude(u => u.AssignedTasks)
            .Include(m => m.User)
                .ThenInclude(u => u.WorkLogs)
            .Include(m => m.User)
                .ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ToListAsync();

        var result = members.Select(m =>
        {
            var activeTasks = m.User.AssignedTasks.Count(t => t.Status != 3);
            var maxTasks = 10;
            var hours = m.User.WorkLogs
                .Where(w => w.StartTime >= DateTime.UtcNow.AddDays(-7))
                .Sum(w => w.TotalHours);
            var maxHours = 40.0;
            var workload = (int)Math.Min(100, Math.Round((double)activeTasks / maxTasks * 50 + hours / maxHours * 50));

            return new WorkloadMemberDto
            {
                Id = m.UserId,
                Name = $"{m.User.FirstName} {m.User.LastName}",
                Role = m.User.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
                Tasks = activeTasks,
                MaxTasks = maxTasks,
                Hours = Math.Round(hours, 1),
                MaxHours = maxHours,
                Workload = workload
            };
        }).OrderByDescending(w => w.Workload).ToList();

        return Ok(result);
    }

    [HttpGet("employee/{userId}")]
    public async Task<IActionResult> GetByEmployee(int userId)
    {
        var user = await _db.Users
            .Include(u => u.AssignedTasks)
            .Include(u => u.WorkLogs)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return NotFound();

        var activeTasks = user.AssignedTasks.Count(t => t.Status != 3);
        var maxTasks = 10;
        var hours = user.WorkLogs
            .Where(w => w.StartTime >= DateTime.UtcNow.AddDays(-7))
            .Sum(w => w.TotalHours);
        var maxHours = 40.0;
        var workload = (int)Math.Min(100, Math.Round((double)activeTasks / maxTasks * 50 + hours / maxHours * 50));

        return Ok(new WorkloadMemberDto
        {
            Id = user.UserId,
            Name = $"{user.FirstName} {user.LastName}",
            Role = user.UserRoles.FirstOrDefault()?.Role.RoleName ?? "Employee",
            Tasks = activeTasks,
            MaxTasks = maxTasks,
            Hours = Math.Round(hours, 1),
            MaxHours = maxHours,
            Workload = workload
        });
    }

    [HttpGet("recommend/{teamId}")]
    public async Task<IActionResult> Recommend(int teamId, [FromQuery] double hours = 8)
    {
        var members = await _db.Set<Models.TeamMember>()
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User)
                .ThenInclude(u => u.AssignedTasks)
            .Include(m => m.User)
                .ThenInclude(u => u.WorkLogs)
            .ToListAsync();

        var recommendations = members
            .Select(m =>
            {
                var activeTasks = m.User.AssignedTasks.Count(t => t.Status != 3);
                var weeklyHours = m.User.WorkLogs
                    .Where(w => w.StartTime >= DateTime.UtcNow.AddDays(-7))
                    .Sum(w => w.TotalHours);
                var workload = (int)Math.Min(100, Math.Round((double)activeTasks / 10 * 50 + weeklyHours / 40 * 50));

                string reason;
                if (workload < 30) reason = "Low workload — has capacity for new tasks";
                else if (workload < 60) reason = "Moderate workload — can take additional tasks";
                else if (workload < 80) reason = "Nearing capacity — consider carefully";
                else reason = "Overloaded — not recommended";

                return new WorkloadRecommendationDto
                {
                    UserId = m.UserId,
                    Name = $"{m.User.FirstName} {m.User.LastName}",
                    CurrentTasks = activeTasks,
                    Workload = workload,
                    Reason = reason
                };
            })
            .OrderBy(r => r.Workload)
            .ToList();

        return Ok(recommendations);
    }
}
