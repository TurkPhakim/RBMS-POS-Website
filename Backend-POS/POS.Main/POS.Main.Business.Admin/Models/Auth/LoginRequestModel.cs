using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.Auth;

/// <summary>
/// Login request model
/// </summary>
public class LoginRequestModel
{
    /// <summary>
    /// Username for authentication
    /// </summary>
    /// <example>admin</example>
    [Required(ErrorMessage = "Username is required")]
    [StringLength(50, MinimumLength = 4, ErrorMessage = "Username must be between 4 and 50 characters")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Password for authentication
    /// </summary>
    /// <example>Password123!</example>
    [Required(ErrorMessage = "Password is required")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Remember user login session
    /// </summary>
    /// <example>false</example>
    public bool RememberMe { get; set; } = false;

    /// <summary>
    /// reCAPTCHA v2 token from client
    /// </summary>
    [Required(ErrorMessage = "CAPTCHA verification is required")]
    public string CaptchaToken { get; set; } = string.Empty;
}
