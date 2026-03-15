namespace TaskManager.API.DTOs;

public class ProjectDto
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CreatedByManagerId { get; set; }
    public string? ManagerName { get; set; }
    public int? LeadId { get; set; }
    public string? LeadName { get; set; }
    public int Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public int MemberCount { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
}

public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? LeadId { get; set; }
    public int? TeamId { get; set; }
    public List<int>? MemberUserIds { get; set; }
}

public class UpdateProjectRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? LeadId { get; set; }
    public int? Status { get; set; }
}

public class ProjectMemberDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsLead { get; set; }
    public DateTime JoinedDate { get; set; }
}

public class AddMembersRequest
{
    public List<int> UserIds { get; set; } = new();
}
