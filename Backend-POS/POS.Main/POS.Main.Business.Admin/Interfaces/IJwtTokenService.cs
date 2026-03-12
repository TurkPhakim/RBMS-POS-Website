using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Services;

/// <summary>
/// Interface for JWT token generation and validation
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generate JWT access token for a user
    /// </summary>
    /// <param name="user">User entity</param>
    /// <param name="employeeId">Employee ID for audit trail (optional)</param>
    /// <returns>JWT token string</returns>
    string GenerateAccessToken(TbUser user, int? employeeId = null, int? positionId = null);

    /// <summary>
    /// Generate refresh token (random string)
    /// </summary>
    /// <returns>Refresh token string</returns>
    string GenerateRefreshToken();
}
