using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Models.Auth;
using POS.Main.Business.Admin.Services;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// Authentication and authorization endpoints
/// </summary>
[Authorize]
[Route("api/admin/auth")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Login with username and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BaseResponseModel<LoginResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestModel request, CancellationToken ct = default)
    {
        var ipAddress = GetIpAddress();
        return Success(await _authService.LoginAsync(request, ipAddress, ct));
    }

    /// <summary>
    /// Logout and revoke refresh token
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _authService.LogoutAsync(userId, request.RefreshToken, ct);
        return Success("Logout successful");
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BaseResponseModel<TokenResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestModel request, CancellationToken ct = default)
    {
        var ipAddress = GetIpAddress();
        return Success(await _authService.RefreshTokenAsync(request, ipAddress, ct));
    }
}
