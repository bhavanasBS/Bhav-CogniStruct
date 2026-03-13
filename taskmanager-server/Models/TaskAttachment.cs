using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

/// <summary>
/// File attachment associated with a task (project or subtask).
/// </summary>
public class TaskAttachment
{
    [Key]
    public int AttachmentId { get; set; }

    public int TaskId { get; set; }
    public TaskItem Task { get; set; } = null!;

    [Required, MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string FilePath { get; set; } = string.Empty;

    /// <summary>File size in bytes</summary>
    public long FileSize { get; set; }

    /// <summary>MIME type or extension, e.g. "application/pdf"</summary>
    [MaxLength(200)]
    public string? FileType { get; set; }

    public int UploadedByUserId { get; set; }
    public User UploadedBy { get; set; } = null!;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
