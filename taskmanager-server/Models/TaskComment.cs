using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class TaskComment
{
    [Key]
    public int CommentId { get; set; }

    public int TaskId { get; set; }

    public int UserId { get; set; }

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("TaskId")]
    public TaskItem Task { get; set; } = null!;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
