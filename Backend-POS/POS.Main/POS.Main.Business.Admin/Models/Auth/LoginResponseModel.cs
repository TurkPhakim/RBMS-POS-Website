namespace POS.Main.Business.Admin.Models.Auth;

/// <summary>
/// Login response containing authentication tokens and user information
/// </summary>
public class LoginResponseModel
{
    /// <summary>
    /// JWT access token for API authentication
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token for obtaining new access tokens
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Authenticated user information
    /// </summary>
    public UserModel User { get; set; } = null!;
}
