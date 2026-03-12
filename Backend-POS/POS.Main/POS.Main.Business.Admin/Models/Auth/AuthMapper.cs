using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Models.Auth;

public static class AuthMapper
{
    public static UserModel ToUserModel(TbUser user, TbEmployee? employee = null, List<string>? permissions = null)
    {
        return new UserModel
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            EmployeeId = employee?.EmployeeId,
            PositionId = employee?.PositionId,
            PositionName = employee?.Position?.PositionName,
            Permissions = permissions ?? new()
        };
    }

    public static LoginResponseModel ToLoginResponse(string accessToken, string refreshToken, int expiresIn, TbUser user, TbEmployee? employee = null, List<string>? permissions = null)
    {
        return new LoginResponseModel
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = expiresIn,
            User = ToUserModel(user, employee, permissions)
        };
    }

    public static TokenResponseModel ToTokenResponse(string accessToken, string refreshToken, int expiresIn)
    {
        return new TokenResponseModel
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            TokenType = "Bearer",
            ExpiresIn = expiresIn
        };
    }

    public static TbRefreshToken ToRefreshTokenEntity(Guid userId, string token, DateTime expiresAt, string ipAddress)
    {
        return new TbRefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };
    }

    public static TbLoginHistory ToLoginHistoryEntity(Guid? userId, string username, bool success, string ipAddress, string? failureReason = null)
    {
        return new TbLoginHistory
        {
            UserId = userId,
            Username = username,
            Success = success,
            FailureReason = failureReason,
            IpAddress = ipAddress,
            LoginDate = DateTime.UtcNow
        };
    }
}
