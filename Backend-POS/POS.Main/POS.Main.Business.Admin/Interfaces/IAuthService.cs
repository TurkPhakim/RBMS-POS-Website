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
}
