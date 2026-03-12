namespace POS.Main.Business.Admin.Models.Auth;

/// <summary>
/// Token response model containing authentication tokens
/// </summary>
public class TokenResponseModel
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
    /// Token type (Bearer)
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; set; }
}
