using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

/// <summary>
/// Static helper to create notifications during workflow events.
/// Call from any controller.
/// </summary>
public static class NotificationService
{
    // ── Core helper ──
    public static void Create(
        AppDbContext db,
        int userId,
        string title,
        string message,
        string type,
        int? relatedEntityId = null)
    {
        db.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RelatedEntityId = relatedEntityId,
            IsRead = false,
            CreatedDate = DateTime.UtcNow
        });
        // Caller must call SaveChangesAsync
    }

    // ── Convenience methods ──

    public static void TaskAssigned(AppDbContext db, int employeeId, string taskTitle, int taskId, string assignerName)
        => Create(db, employeeId, "Task Assigned",
            $"You have been assigned: \"{taskTitle}\" by {assignerName}.",
            "task_assigned", taskId);

    public static void TaskCompleted(AppDbContext db, int notifyUserId, string taskTitle, int taskId, string employeeName)
        => Create(db, notifyUserId, "Task Completed",
            $"\"{taskTitle}\" was completed by {employeeName}.",
            "task_completed", taskId);

    public static void PauseRequested(AppDbContext db, int teamLeadId, string taskTitle, int taskId, string employeeName)
        => Create(db, teamLeadId, "Pause Request",
            $"{employeeName} requested pause on \"{taskTitle}\".",
            "pause_request", taskId);

    public static void PauseDecision(AppDbContext db, int employeeId, string taskTitle, int taskId, bool approved)
        => Create(db, employeeId, approved ? "Pause Approved" : "Pause Rejected",
            $"Your pause request for \"{taskTitle}\" was {(approved ? "approved" : "rejected")}.",
            approved ? "pause_approved" : "pause_rejected", taskId);

    public static void FeedbackReceived(AppDbContext db, int employeeId, string taskTitle, int taskId)
        => Create(db, employeeId, "Feedback Received",
            $"You received feedback on \"{taskTitle}\".",
            "feedback_received", taskId);

    public static void DeadlineReminder(AppDbContext db, int employeeId, string taskTitle, int taskId, int hoursLeft)
        => Create(db, employeeId, "Deadline Reminder",
            $"\"{taskTitle}\" is due in {hoursLeft} hours.",
            "deadline_reminder", taskId);

    public static void TaskOverdue(AppDbContext db, int userId, string taskTitle, int taskId)
        => Create(db, userId, "Task Overdue",
            $"\"{taskTitle}\" is overdue.",
            "task_overdue", taskId);
}
