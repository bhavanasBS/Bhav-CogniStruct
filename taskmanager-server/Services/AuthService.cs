using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
    Task<UserDto?> GetCurrentUserAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(AppDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        if (!user.IsActive)
            return null;

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

        // If a role is specified in the request, verify user has it
        if (!string.IsNullOrEmpty(request.Role) && !roles.Contains(request.Role, StringComparer.OrdinalIgnoreCase))
            return null;

        var token = _jwt.GenerateToken(user, roles);
        var refreshToken = _jwt.GenerateRefreshToken();

        // Store refresh token on user
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            User = MapUserDto(user, roles)
        };
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

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

        // Assign default role or requested role
        var roleName = string.IsNullOrEmpty(request.Role) ? "Employee" : request.Role;
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
        if (role != null)
        {
            _db.Set<UserRole>().Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
            await _db.SaveChangesAsync();
        }

        var roles = role != null ? new List<string> { role.RoleName } : new List<string>();
        var token = _jwt.GenerateToken(user, roles);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            User = MapUserDto(user, roles)
        };
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken
                && u.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null)
            return null;

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();
        var newToken = _jwt.GenerateToken(user, roles);
        var newRefreshToken = _jwt.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            User = MapUserDto(user, roles)
        };
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return null;

        var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();
        return MapUserDto(user, roles);
    }

    private static UserDto MapUserDto(User user, List<string> roles) => new()
    {
        Id = user.UserId,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Roles = roles,
        IsActive = user.IsActive,
        CreatedDate = user.CreatedDate
    };
}
