using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    // Admin and HR can view all users
    [Authorize(Roles = "Admin,HR")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? role, [FromQuery] string? status)
    {
        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                u.FirstName.Contains(search) ||
                u.LastName.Contains(search) ||
                u.Email.Contains(search));

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == role));

        if (!string.IsNullOrWhiteSpace(status))
        {
            bool isActive = status.Equals("active", StringComparison.OrdinalIgnoreCase);
            query = query.Where(u => u.IsActive == isActive);
        }

        var users = await query.OrderBy(u => u.FirstName).ToListAsync();

        var result = users.Select(u => new UserDto
        {
            Id = u.UserId,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
            IsActive = u.IsActive,
            CreatedDate = u.CreatedDate
        }).ToList();

        return Ok(result);
    }

    // Admin and HR can view any user
    [Authorize(Roles = "Admin,HR")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate
        });
    }

    // Only Admin and HR can create users
    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "Email already exists." });

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Assign roles
        if (request.Roles?.Any() == true)
        {
            var roles = await _db.Roles
                .Where(r => request.Roles.Contains(r.RoleName))
                .ToListAsync();

            foreach (var role in roles)
            {
                _db.Set<UserRole>().Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
            }
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetById), new { id = user.UserId }, new UserDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Roles = request.Roles ?? new List<string>(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate
        });
    }

    // Only Admin and HR can update users
    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName ?? user.FirstName;
        user.LastName = request.LastName ?? user.LastName;
        user.Email = request.Email ?? user.Email;
        user.UpdatedDate = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "User updated." });
    }

    // Only Admin can change user status
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = request.IsActive;
        user.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Status updated." });
    }

    // Only Admin can change user roles
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/roles")]
    public async Task<IActionResult> UpdateRoles(int id, [FromBody] UpdateUserRolesRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return NotFound();

        // Remove existing roles
        _db.Set<UserRole>().RemoveRange(user.UserRoles);

        // Add new roles
        var roles = await _db.Roles
            .Where(r => request.Roles.Contains(r.RoleName))
            .ToListAsync();

        foreach (var role in roles)
        {
            _db.Set<UserRole>().Add(new UserRole { UserId = id, RoleId = role.RoleId });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Roles updated." });
    }

    // Only Admin can delete users
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User deleted." });
    }
}
