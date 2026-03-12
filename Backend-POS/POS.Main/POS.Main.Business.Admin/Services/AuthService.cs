using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Models.Auth;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPermissionService _permissionService;
    private readonly ILogger<AuthService> _logger;

    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IPermissionService permissionService,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _permissionService = permissionService;
        _logger = logger;
    }

    public async Task<LoginResponseModel> LoginAsync(LoginRequestModel request, string ipAddress, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username, ct);

        if (user == null)
        {
            await RecordFailedLoginAsync(request.Username, "Invalid username", ipAddress, ct);
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
        {
            await RecordFailedLoginAsync(user.Username, "Account locked", ipAddress, ct);
            throw new AccountLockedException(user.LockedUntil.Value);
        }

        if (!user.IsActive)
        {
            await RecordFailedLoginAsync(user.Username, "Account disabled", ipAddress, ct);
            throw new AccountDisabledException();
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            await HandleFailedLoginAsync(user, ipAddress, ct);
            throw new InvalidCredentialsException("Invalid username or password");
        }

        user.FailedLoginAttempts = 0;
        user.LockedUntil = null;

        var employee = await _unitOfWork.Employees.GetByUserIdAsync(user.UserId, ct);

        var permissions = new List<string>();
        if (employee?.PositionId != null)
        {
            var permSet = await _permissionService.GetPermissionsByPositionIdAsync(employee.PositionId.Value, ct);
            permissions = permSet.ToList();
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(user, employee?.EmployeeId, employee?.PositionId);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        var refreshTokenEntity = AuthMapper.ToRefreshTokenEntity(
            user.UserId, refreshToken, DateTime.UtcNow.AddDays(request.RememberMe ? 30 : 7), ipAddress);

        await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity, ct);
        await RecordSuccessfulLoginAsync(user.UserId, user.Username, ipAddress, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("User logged in: {UserId} - {Username}, IP: {IpAddress}", user.UserId, user.Username, ipAddress);

        return AuthMapper.ToLoginResponse(accessToken, refreshToken, 3600, user, employee, permissions);
    }

    public async Task LogoutAsync(Guid userId, string refreshToken, CancellationToken ct = default)
    {
        var token = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken, ct);

        if (token != null && token.UserId == userId && token.IsActive)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("User logged out: {UserId}", userId);
        }
    }

    public async Task<TokenResponseModel> RefreshTokenAsync(RefreshTokenRequestModel request, string ipAddress, CancellationToken ct = default)
    {
        var token = await _unitOfWork.RefreshTokens.GetByTokenAsync(request.RefreshToken, ct);

        if (token == null || !token.IsActive)
            throw new InvalidRefreshTokenException();

        var user = await _unitOfWork.Users.GetByIdAsync(token.UserId, ct);
        if (user == null || !user.IsActive)
            throw new InvalidRefreshTokenException();

        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;

        var employee = await _unitOfWork.Employees.GetByUserIdAsync(user.UserId, ct);

        var newAccessToken = _jwtTokenService.GenerateAccessToken(user, employee?.EmployeeId, employee?.PositionId);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        var newRefreshTokenEntity = AuthMapper.ToRefreshTokenEntity(
            user.UserId, newRefreshToken, DateTime.UtcNow.AddDays(7), ipAddress);

        await _unitOfWork.RefreshTokens.AddAsync(newRefreshTokenEntity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Token refreshed: {UserId}, IP: {IpAddress}", user.UserId, ipAddress);

        return AuthMapper.ToTokenResponse(newAccessToken, newRefreshToken, 3600);
    }

    // user update (FailedLoginAttempts, LockedUntil) จะ commit พร้อม login history ใน RecordFailedLoginAsync เพราะอยู่ใน DbContext เดียวกัน
    private async Task HandleFailedLoginAsync(TbUser user, string ipAddress, CancellationToken ct = default)
    {
        user.FailedLoginAttempts++;

        if (user.FailedLoginAttempts >= MaxFailedAttempts)
            user.LockedUntil = DateTime.UtcNow.AddMinutes(LockoutMinutes);

        await RecordFailedLoginAsync(user.Username, "Invalid password", ipAddress, ct);
    }

    private async Task RecordSuccessfulLoginAsync(Guid userId, string username, string ipAddress, CancellationToken ct = default)
    {
        var loginHistory = AuthMapper.ToLoginHistoryEntity(userId, username, true, ipAddress);
        await _unitOfWork.LoginHistory.AddAsync(loginHistory, ct);
    }

    private async Task RecordFailedLoginAsync(string username, string failureReason, string ipAddress, CancellationToken ct = default)
    {
        var loginHistory = AuthMapper.ToLoginHistoryEntity(null, username, false, ipAddress, failureReason);
        await _unitOfWork.LoginHistory.AddAsync(loginHistory, ct);
        await _unitOfWork.CommitAsync(ct);
    }
}
