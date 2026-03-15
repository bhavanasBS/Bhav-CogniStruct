using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models;

public class ProjectMember
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
}
