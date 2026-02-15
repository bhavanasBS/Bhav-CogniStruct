namespace TaskManager.API.DTOs;

public class TeamDto
{
    public int Id { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public int MemberCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<TeamMemberDto>? Members { get; set; }
}

public class CreateTeamRequest
{
    public string TeamName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ManagerId { get; set; }
}

public class UpdateTeamRequest
{
    public string? TeamName { get; set; }
    public string? Description { get; set; }
    public int? ManagerId { get; set; }
    public bool? IsActive { get; set; }
}

public class TeamMemberDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Role { get; set; }
    public DateTime JoinedDate { get; set; }
}

public class AddMemberRequest
{
    public int UserId { get; set; }
}

public class HierarchyNode
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Role { get; set; }
    public List<HierarchyNode> Children { get; set; } = new();
}
