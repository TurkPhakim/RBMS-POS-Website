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

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BaseResponseModel<ForgotPasswordResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestModel request, CancellationToken ct = default)
    {
        return Success(await _authService.ForgotPasswordAsync(request, ct));
    }

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BaseResponseModel<VerifyOtpResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestModel request, CancellationToken ct = default)
    {
        return Success(await _authService.VerifyOtpAsync(request, ct));
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestModel request, CancellationToken ct = default)
    {
        await _authService.ResetPasswordAsync(request, ct);
        return Success("รีเซ็ตรหัสผ่านสำเร็จ");
    }

    [HttpPost("change-password")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _authService.ChangePasswordAsync(userId, request, ct);
        return Success("เปลี่ยนรหัสผ่านสำเร็จ");
    }

    [HttpPost("verify-password")]
    [ProducesResponseType(typeof(BaseResponseModel<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        return Success(await _authService.VerifyPasswordAsync(userId, request.Password, ct));
    }

    [HttpPost("pin/setup")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetupPin([FromBody] SetupPinRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _authService.SetupPinAsync(userId, request.PinCode, ct);
        return Success("ตั้งค่า PIN สำเร็จ");
    }

    [HttpPost("pin/change")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePin([FromBody] ChangePinRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _authService.ChangePinAsync(userId, request.CurrentPinCode, request.NewPinCode, ct);
        return Success("เปลี่ยน PIN สำเร็จ");
    }

    [HttpPost("pin/verify")]
    [ProducesResponseType(typeof(BaseResponseModel<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> VerifyPin([FromBody] VerifyPinRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        return Success(await _authService.VerifyPinAsync(userId, request.PinCode, ct));
    }

    [HttpPost("pin/reset")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ResetPin([FromBody] ResetPinRequestModel request, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _authService.ResetPinAsync(userId, request.Password, ct);
        return Success("รีเซ็ต PIN สำเร็จ");
    }
}
