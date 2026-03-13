using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskCommentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TaskCommentsController(AppDbContext db) => _db = db;

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("UserId")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }

    // ═══════════════════════════════════════════════════
    // POST /api/tasks/{taskId}/comments
    // ═══════════════════════════════════════════════════

    [HttpPost("tasks/{taskId}/comments")]
    public async Task<IActionResult> Create(int taskId, [FromBody] CreateCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message is required." });

        var task = await _db.Tasks
            .Include(t => t.ParentTask)
            .Include(t => t.Team)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);

        if (task == null) return NotFound(new { message = "Task not found." });

        var userId = GetCurrentUserId();

        // RBAC: task assignee, project TeamLead, team Manager, or Admin
        var isAssignee = task.AssigneeId == userId;
        var isProjectLead = task.ParentTask?.AssigneeId == userId;
        var isTeamManager = task.Team?.ManagerId == userId;
        var isAdmin = User.IsInRole("Admin");

        if (!isAssignee && !isProjectLead && !isTeamManager && !isAdmin)
            return StatusCode(403, new { message = "You do not have permission to comment on this task." });

        var comment = new TaskComment
        {
            TaskId = taskId,
            UserId = userId,
            Message = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);

        return Ok(new
        {
            comment.CommentId,
            userName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown",
            comment.Message,
            comment.CreatedAt
        });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{taskId}/comments
    // ═══════════════════════════════════════════════════

    [HttpGet("tasks/{taskId}/comments")]
    public async Task<IActionResult> GetByTask(int taskId)
    {
        var comments = await _db.TaskComments
            .Where(c => c.TaskId == taskId)
            .Include(c => c.User)
            .OrderBy(c => c.CreatedAt) // oldest first for chat-like flow
            .Select(c => new
            {
                c.CommentId,
                userName = c.User != null ? c.User.FirstName + " " + c.User.LastName : "Unknown",
                userId = c.UserId,
                c.Message,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }
}

public class CreateCommentRequest
{
    public string Message { get; set; } = string.Empty;
}
