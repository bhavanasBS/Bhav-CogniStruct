using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;
using System.Security.Claims;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                          ?? User.FindFirst("sub")
                          ?? User.FindFirst("userId");
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
    }

    /// <summary>
    /// Get current user's settings
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        // Create default settings if not exist
        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync();
        }

        return Ok(MapToDto(settings));
    }

    /// <summary>
    /// Get settings by user ID (admin only)
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetSettingsByUserId(int userId)
    {
        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
            await _db.SaveChangesAsync();
        }

        return Ok(MapToDto(settings));
    }

    /// <summary>
    /// Update current user's settings
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
        }

        // Update notification settings
        if (request.EmailNotifications.HasValue)
            settings.EmailNotifications = request.EmailNotifications.Value;
        if (request.PushNotifications.HasValue)
            settings.PushNotifications = request.PushNotifications.Value;
        if (request.TaskUpdateNotifications.HasValue)
            settings.TaskUpdateNotifications = request.TaskUpdateNotifications.Value;


        // Update appearance settings
        if (!string.IsNullOrWhiteSpace(request.Theme))
            settings.Theme = request.Theme;
        if (request.CompactMode.HasValue)
            settings.CompactMode = request.CompactMode.Value;

        // Update privacy settings
        if (request.ShowOnlineStatus.HasValue)
            settings.ShowOnlineStatus = request.ShowOnlineStatus.Value;
        if (request.ShowLastSeen.HasValue)
            settings.ShowLastSeen = request.ShowLastSeen.Value;

        // Update timezone
        if (!string.IsNullOrWhiteSpace(request.TimeZone))
            settings.TimeZone = request.TimeZone;

        settings.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(settings));
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found");

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            // Check if email is already taken by another user
            var existingUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.UserId != userId);
            if (existingUser != null)
                return BadRequest("Email is already in use");
            user.Email = request.Email;
        }

        user.UpdatedDate = DateTime.UtcNow;

        // Update timezone in settings
        if (!string.IsNullOrWhiteSpace(request.TimeZone))
        {
            var settings = await _db.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);
            if (settings == null)
            {
                settings = new UserSettings { UserId = userId, TimeZone = request.TimeZone };
                _db.UserSettings.Add(settings);
            }
            else
            {
                settings.TimeZone = request.TimeZone;
                settings.UpdatedDate = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            userId = user.UserId,
            firstName = user.FirstName,
            lastName = user.LastName,
            email = user.Email,
            message = "Profile updated successfully"
        });
    }

    /// <summary>
    /// Update only notification settings
    /// </summary>
    [HttpPatch("notifications")]
    public async Task<IActionResult> UpdateNotifications([FromBody] UpdateSettingsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
        }

        if (request.EmailNotifications.HasValue)
            settings.EmailNotifications = request.EmailNotifications.Value;
        if (request.PushNotifications.HasValue)
            settings.PushNotifications = request.PushNotifications.Value;
        if (request.TaskUpdateNotifications.HasValue)
            settings.TaskUpdateNotifications = request.TaskUpdateNotifications.Value;


        settings.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Notification settings updated" });
    }

    /// <summary>
    /// Update only appearance settings
    /// </summary>
    [HttpPatch("appearance")]
    public async Task<IActionResult> UpdateAppearance([FromBody] UpdateSettingsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
        }

        if (!string.IsNullOrWhiteSpace(request.Theme))
            settings.Theme = request.Theme;
        if (request.CompactMode.HasValue)
            settings.CompactMode = request.CompactMode.Value;

        settings.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Appearance settings updated" });
    }

    /// <summary>
    /// Update only privacy settings
    /// </summary>
    [HttpPatch("privacy")]
    public async Task<IActionResult> UpdatePrivacy([FromBody] UpdateSettingsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0) return Unauthorized();

        var settings = await _db.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserSettings { UserId = userId };
            _db.UserSettings.Add(settings);
        }

        if (request.ShowOnlineStatus.HasValue)
            settings.ShowOnlineStatus = request.ShowOnlineStatus.Value;
        if (request.ShowLastSeen.HasValue)
            settings.ShowLastSeen = request.ShowLastSeen.Value;

        settings.UpdatedDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Privacy settings updated" });
    }

    private static UserSettingsDto MapToDto(UserSettings s) => new()
    {
        SettingsId = s.SettingsId,
        UserId = s.UserId,
        TimeZone = s.TimeZone,
        EmailNotifications = s.EmailNotifications,
        PushNotifications = s.PushNotifications,
        TaskUpdateNotifications = s.TaskUpdateNotifications,

        Theme = s.Theme,
        CompactMode = s.CompactMode,
        ShowOnlineStatus = s.ShowOnlineStatus,
        ShowLastSeen = s.ShowLastSeen,
    };
}
