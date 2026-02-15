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
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
    public int Priority { get; set; }
    public int Status { get; set; }
    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public double TotalLoggedHours { get; set; }
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? AssigneeId { get; set; }
    public int? AssignerId { get; set; }
    public int? TeamId { get; set; }
    public int Priority { get; set; } = 1;
    public DateTime? Deadline { get; set; }
    public double EstimatedHours { get; set; }
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? AssigneeId { get; set; }
    public int? TeamId { get; set; }
    public int? Priority { get; set; }
    public int? Status { get; set; }
    public DateTime? Deadline { get; set; }
    public double? EstimatedHours { get; set; }
}

public class UpdateTaskStatusRequest
{
    public int Status { get; set; }
}
