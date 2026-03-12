using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

/// <summary>
/// Refresh token request model
/// </summary>
public class RefreshTokenRequestModel
{
    /// <summary>
    /// Refresh token to obtain new access token
    /// </summary>
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}
