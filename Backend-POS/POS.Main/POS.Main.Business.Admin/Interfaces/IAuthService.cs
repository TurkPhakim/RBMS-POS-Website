using POS.Main.Business.Admin.Models.Auth;

namespace POS.Main.Business.Admin.Services;

/// <summary>
/// Interface for authentication service
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticate user with username and password
    /// </summary>
    Task<LoginResponseModel> LoginAsync(LoginRequestModel request, string ipAddress, CancellationToken ct = default);

    /// <summary>
    /// Logout user and revoke refresh token
    /// </summary>
    Task LogoutAsync(Guid userId, string refreshToken, CancellationToken ct = default);

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    Task<TokenResponseModel> RefreshTokenAsync(RefreshTokenRequestModel request, string ipAddress, CancellationToken ct = default);

    Task<ForgotPasswordResponseModel> ForgotPasswordAsync(ForgotPasswordRequestModel request, CancellationToken ct = default);

    Task<VerifyOtpResponseModel> VerifyOtpAsync(VerifyOtpRequestModel request, CancellationToken ct = default);

    Task ResetPasswordAsync(ResetPasswordRequestModel request, CancellationToken ct = default);

    Task ChangePasswordAsync(Guid userId, ChangePasswordRequestModel request, CancellationToken ct = default);

    Task<bool> VerifyPasswordAsync(Guid userId, string password, CancellationToken ct = default);

    Task SetupPinAsync(Guid userId, string pinCode, CancellationToken ct = default);

    Task ChangePinAsync(Guid userId, string currentPinCode, string newPinCode, CancellationToken ct = default);

    Task<bool> VerifyPinAsync(Guid userId, string pinCode, CancellationToken ct = default);

    Task ResetPinAsync(Guid userId, string password, CancellationToken ct = default);
}
