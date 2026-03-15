using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class EmployeeReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmployeeReviewsController(AppDbContext db) => _db = db;

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    // ═══════════════════════════════════════════════════
    // POST /api/reviews
    // Manager creates a periodic performance review for an employee
    // ═══════════════════════════════════════════════════

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var currentUserId = GetCurrentUserId();

        // Verify the manager manages a project the employee is part of
        var managerProjectIds = await _db.Tasks
            .Where(t => t.AssignerId == currentUserId && t.ParentTaskId == null)
            .Select(t => t.TaskId)
            .ToListAsync();

        if (!managerProjectIds.Any())
            return StatusCode(403, new { message = "You do not manage any projects." });

        var isEmployeeInProject = await _db.Tasks
            .AnyAsync(t => t.ParentTaskId.HasValue
                        && managerProjectIds.Contains(t.ParentTaskId.Value)
                        && t.AssigneeId == request.EmployeeId);

        if (!isEmployeeInProject)
            return StatusCode(403, new { message = "You can only review employees in your projects." });

        // Validate score
        if (request.PerformanceScore < 0 || request.PerformanceScore > 100)
            return BadRequest(new { message = "PerformanceScore must be between 0 and 100." });

        // One review per employee per period
        var exists = await _db.EmployeeReviews
            .AnyAsync(r => r.EmployeeId == request.EmployeeId && r.ReviewPeriod == request.ReviewPeriod);

        if (exists)
            return BadRequest(new { message = $"Review already exists for this employee for period '{request.ReviewPeriod}'." });

        var review = new EmployeeReview
        {
            EmployeeId = request.EmployeeId,
            ManagerId = currentUserId,
            ReviewPeriod = request.ReviewPeriod,
            PerformanceScore = request.PerformanceScore,
            Strengths = request.Strengths,
            ImprovementAreas = request.ImprovementAreas,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _db.EmployeeReviews.Add(review);

        // Notify employee about the review
        var manager = await _db.Users.FindAsync(currentUserId);
        var managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : "your manager";
        Services.NotificationService.Create(_db, request.EmployeeId,
            "Manager Review",
            $"You received a performance review from {managerName} for period \"{request.ReviewPeriod}\".",
            "manager_review", review.ReviewId);

        await _db.SaveChangesAsync();

        return Ok(new { message = "Review submitted successfully.", reviewId = review.ReviewId });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/reviews/employee/{employeeId}
    // Returns review history for an employee (Manager/Admin/TeamLead)
    // ═══════════════════════════════════════════════════

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,Manager,TeamLead,Team Lead")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var reviews = await _db.EmployeeReviews
            .Where(r => r.EmployeeId == employeeId)
            .Include(r => r.Manager)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.ReviewId,
                r.EmployeeId,
                r.ReviewPeriod,
                r.PerformanceScore,
                r.Strengths,
                r.ImprovementAreas,
                r.Comment,
                ManagerName = r.Manager.FirstName + " " + r.Manager.LastName,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/reviews/mine
    // Employee views their own reviews
    // ═══════════════════════════════════════════════════

    [HttpGet("mine")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyReviews()
    {
        var userId = GetCurrentUserId();

        var reviews = await _db.EmployeeReviews
            .Where(r => r.EmployeeId == userId)
            .Include(r => r.Manager)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.ReviewId,
                r.ReviewPeriod,
                r.PerformanceScore,
                r.Strengths,
                r.ImprovementAreas,
                r.Comment,
                ManagerName = r.Manager.FirstName + " " + r.Manager.LastName,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/reviews/team
    // Manager views all reviews they created
    // ═══════════════════════════════════════════════════

    [HttpGet("team")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetTeamReviews()
    {
        var managerId = GetCurrentUserId();

        var reviews = await _db.EmployeeReviews
            .Where(r => r.ManagerId == managerId)
            .Include(r => r.Employee)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.ReviewId,
                r.EmployeeId,
                EmployeeName = r.Employee.FirstName + " " + r.Employee.LastName,
                r.ReviewPeriod,
                r.PerformanceScore,
                r.Strengths,
                r.ImprovementAreas,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }
}

// ─── Request DTO ───────────────────────────────────

public class CreateReviewRequest
{
    public int EmployeeId { get; set; }
    public string ReviewPeriod { get; set; } = string.Empty;
    public int PerformanceScore { get; set; }
    public string? Strengths { get; set; }
    public string? ImprovementAreas { get; set; }
    public string? Comment { get; set; }
}
