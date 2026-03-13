using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public class TaskFeedbackController : ControllerBase
{
    private readonly AppDbContext _db;

    public TaskFeedbackController(AppDbContext db) => _db = db;

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    private static string GetRatingLabel(double rating)
    {
        if (rating >= 4.5) return "Excellent";
        if (rating >= 3.5) return "Very Good";
        if (rating >= 2.5) return "Satisfactory";
        if (rating >= 1.5) return "Needs Improvement";
        return "Poor";
    }

    // ═══════════════════════════════════════════════════
    // POST /api/feedback/task
    // TeamLead submits performance feedback for a completed subtask
    // ═══════════════════════════════════════════════════

    [HttpPost("task")]
    [Authorize(Roles = "TeamLead")]
    public async Task<IActionResult> SubmitFeedback([FromBody] SubmitFeedbackRequest request)
    {
        var currentUserId = GetCurrentUserId();

        // Load task with parent
        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .FirstOrDefaultAsync(t => t.TaskId == request.TaskId);

        if (task == null)
            return NotFound(new { message = "Task not found." });

        // Must be a subtask
        if (task.ParentTaskId == null)
            return BadRequest(new { message = "Feedback can only be submitted for subtasks, not projects." });

        // Must be completed
        if (task.Status != 3)
            return BadRequest(new { message = "Feedback can only be submitted for completed tasks." });

        // TeamLead must own the parent project
        if (task.ParentTask?.AssigneeId != currentUserId)
            return StatusCode(403, new { message = "Only the TeamLead of the parent project can submit feedback." });

        // Must have an assignee
        if (task.AssigneeId == null)
            return BadRequest(new { message = "Task has no assigned employee." });

        // One feedback per task
        var exists = await _db.TaskFeedbacks.AnyAsync(f => f.TaskId == request.TaskId);
        if (exists)
            return BadRequest(new { message = "Feedback already submitted for this task." });

        // Validate individual ratings
        if (request.WorkQualityRating < 1 || request.WorkQualityRating > 5 ||
            request.TimelinessRating < 1 || request.TimelinessRating > 5 ||
            request.CommunicationRating < 1 || request.CommunicationRating > 5)
            return BadRequest(new { message = "All ratings must be between 1 and 5." });

        // Calculate overall rating
        var overallRating = Math.Round(
            (request.WorkQualityRating + request.TimelinessRating + request.CommunicationRating) / 3.0, 1);

        var feedback = new TaskFeedback
        {
            TaskId = request.TaskId,
            EmployeeId = task.AssigneeId.Value,
            TeamLeadId = currentUserId,
            WorkQualityRating = request.WorkQualityRating,
            TimelinessRating = request.TimelinessRating,
            CommunicationRating = request.CommunicationRating,
            OverallRating = overallRating,
            Strengths = request.Strengths,
            Improvements = request.Improvements,
            CreatedAt = DateTime.UtcNow
        };

        _db.TaskFeedbacks.Add(feedback);

        // Notify employee about feedback
        Services.NotificationService.FeedbackReceived(_db, task.AssigneeId.Value, task.Title, task.TaskId);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Feedback submitted successfully.",
            feedbackId = feedback.FeedbackId,
            overallRating = overallRating,
            overallLabel = GetRatingLabel(overallRating)
        });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/feedback/employee/{employeeId}
    // Returns all feedback for an employee
    // ═══════════════════════════════════════════════════

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,Manager,TeamLead")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var feedbacks = await _db.TaskFeedbacks
            .Where(f => f.EmployeeId == employeeId)
            .Include(f => f.Task)
            .Include(f => f.TeamLead)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.FeedbackId,
                f.TaskId,
                TaskTitle = f.Task.Title,
                f.WorkQualityRating,
                f.TimelinessRating,
                f.CommunicationRating,
                f.OverallRating,
                OverallLabel = f.OverallRating >= 4.5 ? "Excellent"
                    : f.OverallRating >= 3.5 ? "Very Good"
                    : f.OverallRating >= 2.5 ? "Satisfactory"
                    : f.OverallRating >= 1.5 ? "Needs Improvement"
                    : "Poor",
                f.Strengths,
                f.Improvements,
                TeamLeadName = f.TeamLead.FirstName + " " + f.TeamLead.LastName,
                f.CreatedAt
            })
            .ToListAsync();

        return Ok(feedbacks);
    }

    // ═══════════════════════════════════════════════════
    // GET /api/feedback/mine
    // Employee views their own feedback
    // ═══════════════════════════════════════════════════

    [HttpGet("mine")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyFeedback()
    {
        var currentUserId = GetCurrentUserId();

        var feedbacks = await _db.TaskFeedbacks
            .Where(f => f.EmployeeId == currentUserId)
            .Include(f => f.Task)
            .Include(f => f.TeamLead)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.FeedbackId,
                f.TaskId,
                TaskTitle = f.Task.Title,
                f.WorkQualityRating,
                f.TimelinessRating,
                f.CommunicationRating,
                f.OverallRating,
                OverallLabel = f.OverallRating >= 4.5 ? "Excellent"
                    : f.OverallRating >= 3.5 ? "Very Good"
                    : f.OverallRating >= 2.5 ? "Satisfactory"
                    : f.OverallRating >= 1.5 ? "Needs Improvement"
                    : "Poor",
                f.Strengths,
                f.Improvements,
                TeamLeadName = f.TeamLead.FirstName + " " + f.TeamLead.LastName,
                f.CreatedAt
            })
            .ToListAsync();

        return Ok(feedbacks);
    }
}

// ─── Request DTO ───────────────────────────────────

public class SubmitFeedbackRequest
{
    public int TaskId { get; set; }
    public int WorkQualityRating { get; set; }
    public int TimelinessRating { get; set; }
    public int CommunicationRating { get; set; }
    public string? Strengths { get; set; }
    public string? Improvements { get; set; }
}
