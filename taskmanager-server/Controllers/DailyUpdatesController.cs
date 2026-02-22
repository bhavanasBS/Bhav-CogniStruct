using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/daily-updates")]
[Authorize]
public class DailyUpdatesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DailyUpdatesController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    private string GetUserRole() =>
        User.FindFirst(ClaimTypes.Role)?.Value ?? "Employee";

    // ─── Employee: Get today's status ────────────────────
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var userId = GetUserId();
        var today = DateTime.UtcNow.Date;

        var update = await _db.DailyUpdateStatuses
            .Include(d => d.AcknowledgedBy)
            .FirstOrDefaultAsync(d => d.UserId == userId && d.UpdateDate == today);

        if (update == null)
        {
            return Ok(new DailyUpdateStatusDto
            {
                UserId = userId,
                UpdateDate = today,
                IsSent = false,
                Summary = null,
                AcknowledgedByName = null,
                AcknowledgedAt = null,
            });
        }

        return Ok(new DailyUpdateStatusDto
        {
            DailyUpdateId = update.DailyUpdateId,
            UserId = update.UserId,
            UpdateDate = update.UpdateDate,
            IsSent = update.IsSent,
            Summary = update.Summary,
            AcknowledgedByName = update.AcknowledgedBy != null
                ? $"{update.AcknowledgedBy.FirstName} {update.AcknowledgedBy.LastName}"
                : null,
            AcknowledgedAt = update.AcknowledgedAt,
        });
    }

    // ─── Employee: Get own history (last 30 days) ────────
    [HttpGet("my-history")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userId = GetUserId();
        var since = DateTime.UtcNow.Date.AddDays(-30);

        var updates = await _db.DailyUpdateStatuses
            .Include(d => d.AcknowledgedBy)
            .Where(d => d.UserId == userId && d.UpdateDate >= since)
            .OrderByDescending(d => d.UpdateDate)
            .Select(d => new DailyUpdateStatusDto
            {
                DailyUpdateId = d.DailyUpdateId,
                UserId = d.UserId,
                UpdateDate = d.UpdateDate,
                IsSent = d.IsSent,
                Summary = d.Summary,
                AcknowledgedByName = d.AcknowledgedBy != null
                    ? d.AcknowledgedBy.FirstName + " " + d.AcknowledgedBy.LastName
                    : null,
                AcknowledgedAt = d.AcknowledgedAt,
            })
            .ToListAsync();

        return Ok(updates);
    }

    // ─── Employee: Submit/toggle today's update ──────────
    [HttpPost]
    public async Task<IActionResult> SubmitUpdate([FromBody] SubmitDailyUpdateDto dto)
    {
        var userId = GetUserId();
        var today = DateTime.UtcNow.Date;

        var existing = await _db.DailyUpdateStatuses
            .FirstOrDefaultAsync(d => d.UserId == userId && d.UpdateDate == today);

        if (existing != null)
        {
            existing.IsSent = dto.IsSent;
            existing.Summary = dto.Summary;
            existing.UpdatedDate = DateTime.UtcNow;
        }
        else
        {
            existing = new DailyUpdateStatus
            {
                UserId = userId,
                UpdateDate = today,
                IsSent = dto.IsSent,
                Summary = dto.Summary,
            };
            _db.DailyUpdateStatuses.Add(existing);
        }

        await _db.SaveChangesAsync();

        return Ok(new DailyUpdateStatusDto
        {
            DailyUpdateId = existing.DailyUpdateId,
            UserId = existing.UserId,
            UpdateDate = existing.UpdateDate,
            IsSent = existing.IsSent,
            Summary = existing.Summary,
        });
    }

    // ─── Employee: Get team lead info for the "To" field ─
    [HttpGet("team-lead")]
    public async Task<IActionResult> GetTeamLead()
    {
        var userId = GetUserId();

        // Find the team this employee belongs to, then get the manager
        var membership = await _db.TeamMembers
            .Include(tm => tm.Team)
                .ThenInclude(t => t.Manager)
            .FirstOrDefaultAsync(tm => tm.UserId == userId);

        if (membership?.Team?.Manager != null)
        {
            var manager = membership.Team.Manager;
            return Ok(new
            {
                name = $"{manager.FirstName} {manager.LastName}",
                email = manager.Email,
                teamName = membership.Team.TeamName,
            });
        }

        return Ok(new { name = (string?)null, email = (string?)null, teamName = (string?)null });
    }

    // ─── Employee: Get all possible recipients for the "To" dropdown ─
    [HttpGet("recipients")]
    public async Task<IActionResult> GetRecipients()
    {
        var userId = GetUserId();

        // Find all teams this employee belongs to
        var memberships = await _db.TeamMembers
            .Where(tm => tm.UserId == userId)
            .Include(tm => tm.Team)
                .ThenInclude(t => t.Manager)
            .ToListAsync();

        var recipients = new List<object>();
        var addedUserIds = new HashSet<int>();

        foreach (var membership in memberships)
        {
            if (membership.Team?.Manager != null && !addedUserIds.Contains(membership.Team.Manager.UserId))
            {
                var mgr = membership.Team.Manager;
                addedUserIds.Add(mgr.UserId);
                recipients.Add(new
                {
                    userId = mgr.UserId,
                    name = $"{mgr.FirstName} {mgr.LastName}",
                    email = mgr.Email,
                    teamName = membership.Team.TeamName,
                    role = "Team Lead",
                    isDefault = recipients.Count == 0, // First one is default
                });
            }
        }

        // If no recipients found, return empty
        return Ok(recipients);
    }

    // ─── Team Lead: View team members' update status ─────
    [HttpGet("team")]
    public async Task<IActionResult> GetTeamUpdates([FromQuery] DateTime? date)
    {
        var userId = GetUserId();
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;

        // Get teams managed by this user
        var managedTeamIds = await _db.Teams
            .Where(t => t.ManagerId == userId && t.IsActive)
            .Select(t => t.TeamId)
            .ToListAsync();

        if (!managedTeamIds.Any())
            return Ok(new List<TeamDailyUpdateDto>());

        // Get all members in managed teams
        var members = await _db.TeamMembers
            .Where(tm => managedTeamIds.Contains(tm.TeamId))
            .Include(tm => tm.User)
            .Select(tm => tm.User)
            .Distinct()
            .ToListAsync();

        var memberIds = members.Select(m => m.UserId).ToList();

        // Get daily updates for the target date
        var updates = await _db.DailyUpdateStatuses
            .Where(d => memberIds.Contains(d.UserId) && d.UpdateDate == targetDate)
            .ToListAsync();

        // Calculate consecutive days for each member
        var result = new List<TeamDailyUpdateDto>();
        foreach (var member in members)
        {
            var update = updates.FirstOrDefault(u => u.UserId == member.UserId);

            // Count consecutive sent days (including today)
            var consecutive = 0;
            var checkDate = targetDate;
            while (true)
            {
                var dayUpdate = await _db.DailyUpdateStatuses
                    .AnyAsync(d => d.UserId == member.UserId && d.UpdateDate == checkDate && d.IsSent);
                if (!dayUpdate) break;
                consecutive++;
                checkDate = checkDate.AddDays(-1);
            }

            result.Add(new TeamDailyUpdateDto
            {
                UserId = member.UserId,
                EmployeeName = $"{member.FirstName} {member.LastName}",
                EmployeeEmail = member.Email,
                IsSentToday = update?.IsSent ?? false,
                DailyUpdateId = update?.DailyUpdateId,
                Summary = update?.Summary,
                IsAcknowledged = update?.AcknowledgedByUserId != null,
                ConsecutiveDays = consecutive,
            });
        }

        return Ok(result);
    }

    // ─── Team Lead: Acknowledge receipt of update ────────
    [HttpPatch("{id}/acknowledge")]
    public async Task<IActionResult> AcknowledgeUpdate(int id)
    {
        var userId = GetUserId();

        var update = await _db.DailyUpdateStatuses.FindAsync(id);
        if (update == null) return NotFound();

        update.AcknowledgedByUserId = userId;
        update.AcknowledgedAt = DateTime.UtcNow;
        update.UpdatedDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Update acknowledged." });
    }

    // ─── Manager: Weekly aggregated consistency metrics ───
    [HttpGet("consistency")]
    public async Task<IActionResult> GetConsistencyMetrics()
    {
        var userId = GetUserId();

        // Get teams managed by this user
        var managedTeamIds = await _db.Teams
            .Where(t => t.ManagerId == userId && t.IsActive)
            .Select(t => t.TeamId)
            .ToListAsync();

        // Also include teams where user is Admin/Manager role
        var role = GetUserRole();
        if (role == "Admin")
        {
            managedTeamIds = await _db.Teams
                .Where(t => t.IsActive)
                .Select(t => t.TeamId)
                .ToListAsync();
        }

        var memberTeams = await _db.TeamMembers
            .Where(tm => managedTeamIds.Contains(tm.TeamId))
            .Include(tm => tm.User)
            .Include(tm => tm.Team)
            .ToListAsync();

        // Last 7 days of working data
        var weekStart = DateTime.UtcNow.Date.AddDays(-6);
        var weekEnd = DateTime.UtcNow.Date;
        var totalDays = 7;

        var memberIds = memberTeams.Select(mt => mt.UserId).Distinct().ToList();

        var updates = await _db.DailyUpdateStatuses
            .Where(d => memberIds.Contains(d.UserId) && d.UpdateDate >= weekStart && d.UpdateDate <= weekEnd)
            .ToListAsync();

        var result = memberTeams
            .GroupBy(mt => mt.UserId)
            .Select(g =>
            {
                var member = g.First();
                var sentDays = updates.Count(u => u.UserId == member.UserId && u.IsSent);
                return new DailyUpdateConsistencyDto
                {
                    UserId = member.UserId,
                    EmployeeName = $"{member.User.FirstName} {member.User.LastName}",
                    TeamName = member.Team.TeamName,
                    TotalDays = totalDays,
                    SentDays = sentDays,
                    ConsistencyPercent = Math.Round((double)sentDays / totalDays * 100, 1),
                    WeekRange = $"{weekStart:MMM dd} - {weekEnd:MMM dd}",
                };
            })
            .OrderByDescending(c => c.ConsistencyPercent)
            .ToList();

        return Ok(result);
    }

    // ─── HR: Org-level aggregated signals ────────────────
    [HttpGet("org-signals")]
    public async Task<IActionResult> GetOrgSignals()
    {
        var weekStart = DateTime.UtcNow.Date.AddDays(-6);
        var weekEnd = DateTime.UtcNow.Date;

        // All active users with Employee role
        var employees = await _db.Users
            .Where(u => u.IsActive)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == "Employee"))
            .ToListAsync();

        var employeeIds = employees.Select(e => e.UserId).ToList();

        var updates = await _db.DailyUpdateStatuses
            .Where(d => employeeIds.Contains(d.UserId) && d.UpdateDate >= weekStart && d.UpdateDate <= weekEnd && d.IsSent)
            .ToListAsync();

        var totalPossible = employeeIds.Count * 7;
        var totalSent = updates.Count;

        // Per-team breakdown
        var teamMembers = await _db.TeamMembers
            .Where(tm => employeeIds.Contains(tm.UserId))
            .Include(tm => tm.Team)
            .ToListAsync();

        var teamBreakdown = teamMembers
            .GroupBy(tm => tm.Team.TeamName)
            .Select(g =>
            {
                var memberIds = g.Select(tm => tm.UserId).Distinct().ToList();
                var sent = updates.Count(u => memberIds.Contains(u.UserId));
                var total = memberIds.Count * 7;
                return new
                {
                    teamName = g.Key,
                    totalEmployees = memberIds.Count,
                    sentUpdates = sent,
                    totalPossible = total,
                    consistencyPercent = total > 0 ? Math.Round((double)sent / total * 100, 1) : 0,
                };
            })
            .OrderByDescending(t => t.consistencyPercent)
            .ToList();

        return Ok(new
        {
            weekRange = $"{weekStart:MMM dd} - {weekEnd:MMM dd}",
            totalEmployees = employeeIds.Count,
            totalUpdatesSent = totalSent,
            totalPossible,
            overallConsistency = totalPossible > 0 ? Math.Round((double)totalSent / totalPossible * 100, 1) : 0,
            teamBreakdown,
        });
    }
}
