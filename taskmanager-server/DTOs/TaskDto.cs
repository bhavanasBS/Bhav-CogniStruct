namespace TaskManager.API.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public int? AssignerId { get; set; }
    public string? AssignerName { get; set; }

    public int Priority { get; set; }
    public int Status { get; set; }
    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? PausedAt { get; set; }
    public string? PauseReason { get; set; }
    public string? RequiredSkills { get; set; }
    public double TotalLoggedHours { get; set; }
    public DateTime? StartedAt { get; set; }
    public double? SlaHours { get; set; }
    public bool SlaBreached { get; set; }
    // Hierarchy
    public int? ParentTaskId { get; set; }
    public int SubTaskCount { get; set; }
    public int CompletedSubTaskCount { get; set; }
    public bool IsProject { get; set; }
    public string? TeamName { get; set; }
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? AssigneeId { get; set; }
    public int? AssignerId { get; set; }

    public int Priority { get; set; } = 1;
    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }
    public string? RequiredSkills { get; set; }
    public int? ParentTaskId { get; set; }
    public int? ProjectId { get; set; }
    public double? SlaHours { get; set; }
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? AssigneeId { get; set; }

    public int? Priority { get; set; }
    public int? Status { get; set; }
    public DateTime? Deadline { get; set; }
    public double? EstimatedHours { get; set; }
    public string? RequiredSkills { get; set; }
    public double? SlaHours { get; set; }
}

public class UpdateTaskStatusRequest
{
    public int Status { get; set; }
}

public class PauseTaskRequest
{
    public string? Reason { get; set; }
}

public class ReassignTaskRequest
{
    public int NewAssigneeId { get; set; }
    public string? Reason { get; set; }
}
