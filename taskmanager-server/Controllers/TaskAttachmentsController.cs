using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskAttachmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public TaskAttachmentsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirst("UserId")?.Value
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // ═══════════════════════════════════════════════════
    // POST /api/tasks/{taskId}/attachments
    // ═══════════════════════════════════════════════════
    [HttpPost("tasks/{taskId}/attachments")]
    public async Task<IActionResult> Upload(int taskId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null) return NotFound(new { message = "Task not found." });

        var userId = GetUserId();

        // Permission: Employee → own task, TeamLead → subtasks, Manager → projects
        if (User.IsInRole("Employee"))
        {
            if (task.AssigneeId != userId)
                return StatusCode(403, new { message = "You can only upload to your assigned tasks." });
        }
        else if (User.IsInRole("TeamLead") || User.IsInRole("Team Lead"))
        {
            if (task.ParentTaskId == null)
                return StatusCode(403, new { message = "TeamLead can only upload to subtasks." });
            var parent = await _db.Tasks.FirstOrDefaultAsync(t => t.TaskId == task.ParentTaskId);
            if (parent?.AssigneeId != userId)
                return StatusCode(403, new { message = "You can only upload to subtasks of projects assigned to you." });
        }
        else if (User.IsInRole("Manager"))
        {
            if (task.ParentTaskId != null)
                return StatusCode(403, new { message = "Manager can only upload to projects." });
            if (task.AssignerId != userId)
                return StatusCode(403, new { message = "You can only upload to projects you created." });
        }
        // Admin can upload to anything

        // Save file
        var uploadDir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
            "uploads", "tasks", taskId.ToString());
        Directory.CreateDirectory(uploadDir);

        var uniqueName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadDir, uniqueName);

        using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        var attachment = new TaskAttachment
        {
            TaskId = taskId,
            FileName = file.FileName,
            FilePath = $"/uploads/tasks/{taskId}/{uniqueName}",
            FileSize = file.Length,
            FileType = file.ContentType,
            UploadedByUserId = userId,
            UploadedAt = DateTime.UtcNow
        };

        _db.TaskAttachments.Add(attachment);
        await _db.SaveChangesAsync();

        return Ok(new TaskAttachmentDto
        {
            Id = attachment.AttachmentId,
            TaskId = attachment.TaskId,
            FileName = attachment.FileName,
            FilePath = attachment.FilePath,
            FileSize = attachment.FileSize,
            FileType = attachment.FileType,
            UploadedByName = (await _db.Users.FindAsync(userId)) is { } u
                ? $"{u.FirstName} {u.LastName}" : "Unknown",
            UploadedAt = attachment.UploadedAt
        });
    }

    // ═══════════════════════════════════════════════════
    // GET /api/tasks/{taskId}/attachments
    // ═══════════════════════════════════════════════════
    [HttpGet("tasks/{taskId}/attachments")]
    public async Task<IActionResult> List(int taskId)
    {
        var attachments = await _db.TaskAttachments
            .Where(a => a.TaskId == taskId)
            .Include(a => a.UploadedBy)
            .OrderByDescending(a => a.UploadedAt)
            .Select(a => new TaskAttachmentDto
            {
                Id = a.AttachmentId,
                TaskId = a.TaskId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileSize = a.FileSize,
                FileType = a.FileType,
                UploadedByName = a.UploadedBy != null
                    ? $"{a.UploadedBy.FirstName} {a.UploadedBy.LastName}" : "Unknown",
                UploadedAt = a.UploadedAt
            })
            .ToListAsync();

        return Ok(attachments);
    }

    // ═══════════════════════════════════════════════════
    // DELETE /api/attachments/{id}
    // ═══════════════════════════════════════════════════
    [HttpDelete("attachments/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var attachment = await _db.TaskAttachments.FindAsync(id);
        if (attachment == null) return NotFound();

        var userId = GetUserId();

        // Only uploader or Admin can delete
        if (attachment.UploadedByUserId != userId && !User.IsInRole("Admin"))
            return StatusCode(403, new { message = "Only the uploader or an Admin can delete attachments." });

        // Delete physical file
        var physicalPath = Path.Combine(
            _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
            attachment.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(physicalPath))
            System.IO.File.Delete(physicalPath);

        _db.TaskAttachments.Remove(attachment);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Attachment deleted." });
    }
}
