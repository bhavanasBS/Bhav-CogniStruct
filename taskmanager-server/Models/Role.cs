using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models;

public class Role
{
    [Key]
    public int RoleId { get; set; }

    [Required, MaxLength(50)]
    public string RoleName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    // Navigation
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
