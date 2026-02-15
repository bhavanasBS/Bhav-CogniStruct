using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.API.DTOs;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Invalid email, password, or role." });

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _auth.RegisterAsync(request);
        if (result == null)
            return BadRequest(new { message = "Email already exists." });

        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _auth.RefreshTokenAsync(request.RefreshToken);
        if (result == null)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        return Ok(result);
    }
}

[ApiController]
[Route("api/users")]
public class UsersMeController : ControllerBase
{
    private readonly IAuthService _auth;

    public UsersMeController(IAuthService auth)
    {
        _auth = auth;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _auth.GetCurrentUserAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(user);
    }
}
