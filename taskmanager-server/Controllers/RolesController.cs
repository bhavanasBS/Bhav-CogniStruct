using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "Admin")]  // Only Admin can view/manage roles
public class RolesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RolesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _db.Roles
            .Include(r => r.UserRoles)
            .Select(r => new RoleDto
            {
                RoleId = r.RoleId,
                RoleName = r.RoleName,
                Description = r.Description,
                UserCount = r.UserRoles.Count
            })
            .OrderBy(r => r.RoleName)
            .ToListAsync();

        return Ok(roles);
    }
}
