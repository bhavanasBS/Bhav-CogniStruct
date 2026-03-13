using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/skills")]
[Authorize]
public class SkillAnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SkillAnalyticsController(AppDbContext db) => _db = db;

    // ─── GET /api/skills/analytics ───
    // Returns skill-level analytics for the logged-in employee
    [HttpGet("analytics")]
    public async Task<IActionResult> GetMySkillAnalytics()
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.AssignedTasks)
            .FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) return NotFound();

        // Parse user skills
        var userSkills = (user.Skills ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Get all tasks assigned to user
        var allTasks = await _db.Tasks
            .Where(t => t.AssigneeId == userId)
            .ToListAsync();

        // Get all tasks across the system that have RequiredSkills (for recommendations)
        var allTeamTasks = await _db.Tasks
            .Where(t => t.AssigneeId == userId && t.RequiredSkills != null)
            .ToListAsync();

        // Build skill analytics
        var skillAnalytics = userSkills.Select(skill =>
        {
            // Find tasks where this skill was required
            var tasksUsingSkill = allTasks.Where(t =>
                (t.RequiredSkills ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Any(rs => rs.Equals(skill, StringComparison.OrdinalIgnoreCase))
            ).ToList();

            var totalTasksUsed = tasksUsingSkill.Count;
            var completedTasks = tasksUsingSkill.Count(t => t.Status == 3); // Completed
            var successRate = totalTasksUsed > 0 ? Math.Round((double)completedTasks / totalTasksUsed * 100, 1) : 0;

            // Compute skill level based on usage + success
            int skillLevel;
            if (totalTasksUsed == 0) skillLevel = 1;
            else if (totalTasksUsed >= 10 && successRate >= 80) skillLevel = 5;
            else if (totalTasksUsed >= 6 && successRate >= 70) skillLevel = 4;
            else if (totalTasksUsed >= 3 && successRate >= 60) skillLevel = 3;
            else if (totalTasksUsed >= 1) skillLevel = 2;
            else skillLevel = 1;

            // Determine category
            var lowerSkill = skill.ToLowerInvariant();
            string category;
            if (new[] { "javascript", "react", "node.js", "sql", "python", "typescript", "html", "css", "c#", ".net", "java", "angular", "vue", "mongodb", "docker", "aws", "azure", "git" }
                .Contains(lowerSkill))
                category = "Technical";
            else if (new[] { "communication", "team collaboration", "problem solving", "time management", "leadership", "teamwork", "critical thinking", "adaptability" }
                .Contains(lowerSkill))
                category = "Soft Skills";
            else
                category = "Other";

            return new
            {
                name = skill,
                skillLevel,
                tasksUsed = totalTasksUsed,
                completedTasks,
                successRate,
                category,
                needsTraining = skillLevel <= 2
            };
        }).OrderByDescending(s => s.skillLevel).ThenByDescending(s => s.tasksUsed).ToList();

        // Recommended skills: skills required by team tasks that user doesn't have
        var userSkillsLower = userSkills.Select(s => s.ToLowerInvariant()).ToHashSet();
        var requiredSkillsFromTasks = allTeamTasks
            .SelectMany(t => (t.RequiredSkills ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrEmpty(s) && !userSkillsLower.Contains(s.ToLowerInvariant()))
            .GroupBy(s => s, StringComparer.OrdinalIgnoreCase)
            .Select(g => new { name = g.First(), demandCount = g.Count() })
            .OrderByDescending(s => s.demandCount)
            .Take(5)
            .ToList();

        // Summary stats
        var strongSkills = skillAnalytics.Count(s => s.skillLevel >= 4);
        var improvingSkills = skillAnalytics.Count(s => s.skillLevel == 3);
        var needsFocus = skillAnalytics.Count(s => s.skillLevel <= 2);

        // Training requests
        var trainingRequests = await _db.TrainingRequests
            .Where(tr => tr.EmployeeId == userId)
            .OrderByDescending(tr => tr.CreatedAt)
            .Select(tr => new
            {
                tr.RequestId,
                tr.SkillName,
                tr.Reason,
                status = tr.Status == 0 ? "pending" : tr.Status == 1 ? "approved" : "rejected",
                tr.CreatedAt,
                tr.ReviewedAt,
                reviewedBy = tr.ReviewedBy != null ? tr.ReviewedBy.FirstName + " " + tr.ReviewedBy.LastName : null
            })
            .ToListAsync();

        return Ok(new
        {
            skills = skillAnalytics,
            summary = new
            {
                total = skillAnalytics.Count,
                strong = strongSkills,
                improving = improvingSkills,
                needsFocus,
                avgLevel = skillAnalytics.Count > 0
                    ? Math.Round(skillAnalytics.Average(s => s.skillLevel), 1) : 0
            },
            recommendedSkills = requiredSkillsFromTasks,
            trainingRequests
        });
    }

    // ─── POST /api/skills/training-request ───
    [HttpPost("training-request")]
    public async Task<IActionResult> RequestTraining([FromBody] TrainingRequestDto dto)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        // Check if already requested
        var exists = await _db.TrainingRequests
            .AnyAsync(tr => tr.EmployeeId == userId
                         && tr.SkillName.ToLower() == dto.SkillName.ToLower()
                         && tr.Status == 0);
        if (exists) return BadRequest(new { message = "Training request already pending for this skill." });

        var request = new TrainingRequest
        {
            EmployeeId = userId,
            SkillName = dto.SkillName,
            Reason = dto.Reason,
            Status = 0,
            CreatedAt = DateTime.UtcNow
        };
        _db.TrainingRequests.Add(request);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            request.RequestId,
            request.SkillName,
            status = "pending",
            request.CreatedAt
        });
    }

    // ─── GET /api/skills/training-requests (manager view) ───
    [HttpGet("training-requests")]
    [Authorize(Roles = "Manager,Admin,TeamLead")]
    public async Task<IActionResult> GetAllTrainingRequests()
    {
        var requests = await _db.TrainingRequests
            .Include(tr => tr.Employee)
            .OrderByDescending(tr => tr.CreatedAt)
            .Select(tr => new
            {
                tr.RequestId,
                tr.EmployeeId,
                employeeName = tr.Employee.FirstName + " " + tr.Employee.LastName,
                tr.SkillName,
                tr.Reason,
                status = tr.Status == 0 ? "pending" : tr.Status == 1 ? "approved" : "rejected",
                tr.CreatedAt,
                tr.ReviewedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // ─── PUT /api/skills/training-request/{id}/review ───
    [HttpPut("training-request/{id}/review")]
    [Authorize(Roles = "Manager,Admin,TeamLead")]
    public async Task<IActionResult> ReviewTrainingRequest(int id, [FromBody] ReviewDto dto)
    {
        var request = await _db.TrainingRequests.FindAsync(id);
        if (request == null) return NotFound();

        request.Status = dto.Approved ? 1 : 2;
        request.ReviewedAt = DateTime.UtcNow;
        request.ReviewedById = GetUserId();

        await _db.SaveChangesAsync();
        return Ok(new { message = dto.Approved ? "Training request approved." : "Training request rejected." });
    }

    // ─── Helpers ───
    private int GetUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}

public class TrainingRequestDto
{
    public string SkillName { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public class ReviewDto
{
    public bool Approved { get; set; }
}
