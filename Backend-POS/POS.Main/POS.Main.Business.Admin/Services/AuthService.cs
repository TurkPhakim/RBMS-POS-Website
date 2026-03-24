using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.Auth;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Core.Interfaces;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPermissionService _permissionService;
    private readonly IReCaptchaService _reCaptchaService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    private const int LockoutThresholdBase = 3;
    private const int LockoutThresholdIncrement = 2;
    private const int OtpExpiryMinutes = 3;
    private const int ResetTokenExpiryMinutes = 30;
    private const int MaxOtpAttempts = 5;
    private const int PasswordHistoryCount = 3;

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IPermissionService permissionService,
        IReCaptchaService reCaptchaService,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _permissionService = permissionService;
        _reCaptchaService = reCaptchaService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<LoginResponseModel> LoginAsync(LoginRequestModel request, string ipAddress, CancellationToken ct = default)
    {
        await _reCaptchaService.ValidateAsync(request.CaptchaToken, ct);

        var user = await _unitOfWork.Users.GetByUsernameAsync(request.Username, ct);

        if (user == null)
            throw new InvalidCredentialsException("Invalid username or password");

        if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
            throw new AccountLockedException(user.LockedUntil.Value);

        if (user.IsLockedByAdmin)
        {
            if (user.AutoUnlockDate.HasValue && user.AutoUnlockDate <= DateTime.UtcNow)
            {
                user.IsLockedByAdmin = false;
                user.AutoUnlockDate = null;
                await _unitOfWork.CommitAsync(ct);
            }
            else
            {
                throw new AccountLockedByAdminException(user.AutoUnlockDate);
            }
        }

        if (!user.IsActive)
            throw new AccountDisabledException();

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            await HandleFailedLoginAsync(user, ct);
            if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
                throw new AccountLockedException(user.LockedUntil.Value);
            throw new InvalidCredentialsException("Invalid username or password");
        }

        user.FailedLoginAttempts = 0;
        user.LockoutCount = 0;
        user.LockedUntil = null;
        user.LastLoginDate = DateTime.UtcNow;

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

    private async Task HandleFailedLoginAsync(TbUser user, CancellationToken ct = default)
    {
        user.FailedLoginAttempts++;

        // Threshold = 3, 5, 7, 9... (LockoutThresholdBase + LockoutThresholdIncrement * LockoutCount)
        int nextThreshold = LockoutThresholdBase + LockoutThresholdIncrement * user.LockoutCount;

        if (user.FailedLoginAttempts >= nextThreshold)
        {
            user.LockoutCount++;
            // Duration = 1, 3, 5, 7, 9... นาที (2N - 1 โดย N = LockoutCount)
            user.LockedUntil = DateTime.UtcNow.AddMinutes(2 * user.LockoutCount - 1);
        }

        await _unitOfWork.CommitAsync(ct);
    }

    // ========================
    // Forgot Password Flow
    // ========================

    public async Task<ForgotPasswordResponseModel> ForgotPasswordAsync(ForgotPasswordRequestModel request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameOrEmailAsync(request.UsernameOrEmail, ct);

        if (user == null)
            throw new BusinessException("ไม่พบบัญชีผู้ใช้ที่ตรงกับข้อมูลที่ระบุ");

        if (!user.IsActive)
            throw new BusinessException("บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ");

        if (user.IsLockedByAdmin)
            throw new AccountLockedByAdminException(user.AutoUnlockDate);

        // Invalidate OTP เก่าทั้งหมด
        await _unitOfWork.PasswordResetTokens.InvalidateAllByUserIdAsync(user.UserId, ct);

        var otpCode = GenerateOtp();
        var token = new TbPasswordResetToken
        {
            PasswordResetTokenId = Guid.NewGuid(),
            UserId = user.UserId,
            OtpCode = otpCode,
            OtpExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.PasswordResetTokens.AddAsync(token, ct);
        await _unitOfWork.CommitAsync(ct);

        var employeeName = user.Employee != null
            ? $"{user.Employee.FirstNameThai} {user.Employee.LastNameThai}"
            : user.Username;

        var emailHtml = BuildOtpEmailHtml(employeeName, otpCode);
        var emailSent = await _emailService.SendEmailAsync(
            user.Email, employeeName, "RBMS POS - รหัส OTP สำหรับรีเซ็ตรหัสผ่าน", emailHtml, ct);

        if (!emailSent)
            throw new BusinessException("ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง");

        _logger.LogInformation("OTP sent for password reset: {UserId}", user.UserId);

        return new ForgotPasswordResponseModel
        {
            MaskedEmail = MaskEmail(user.Email),
            OtpExpiresInSeconds = OtpExpiryMinutes * 60
        };
    }

    public async Task<VerifyOtpResponseModel> VerifyOtpAsync(VerifyOtpRequestModel request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameOrEmailAsync(request.UsernameOrEmail, ct);

        if (user == null)
            throw new BusinessException("ไม่พบบัญชีผู้ใช้ที่ตรงกับข้อมูลที่ระบุ");

        var token = await _unitOfWork.PasswordResetTokens.GetActiveByUserIdAsync(user.UserId, ct);

        if (token == null)
            throw new BusinessException("รหัส OTP หมดอายุ กรุณาขอรหัสใหม่");

        if (token.OtpAttempts >= MaxOtpAttempts)
        {
            token.IsUsed = true;
            await _unitOfWork.CommitAsync(ct);
            throw new BusinessException("ป้อนรหัส OTP ผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่");
        }

        if (token.OtpCode != request.OtpCode)
        {
            token.OtpAttempts++;
            await _unitOfWork.CommitAsync(ct);
            throw new ValidationException($"รหัส OTP ไม่ถูกต้อง (เหลืออีก {MaxOtpAttempts - token.OtpAttempts} ครั้ง)");
        }

        // OTP ถูกต้อง — สร้าง reset token
        token.OtpVerified = true;
        token.ResetToken = Guid.NewGuid().ToString("N");
        token.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(ResetTokenExpiryMinutes);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("OTP verified for password reset: {UserId}", user.UserId);

        return new VerifyOtpResponseModel
        {
            ResetToken = token.ResetToken,
            ExpiresInMinutes = ResetTokenExpiryMinutes
        };
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestModel request, CancellationToken ct = default)
    {
        var token = await _unitOfWork.PasswordResetTokens.GetByResetTokenAsync(request.ResetToken, ct);

        if (token == null || !token.OtpVerified)
            throw new BusinessException("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ");

        var user = await _unitOfWork.Users.GetByIdAsync(token.UserId, ct);
        if (user == null)
            throw new BusinessException("ไม่พบบัญชีผู้ใช้");

        // ตรวจสอบ password policy
        ValidatePasswordPolicy(request.NewPassword, user.Username);

        // ตรวจสอบ password history (ห้ามซ้ำ 3 รหัสล่าสุด)
        var recentPasswords = await _unitOfWork.PasswordHistory.GetRecentByUserIdAsync(
            user.UserId, PasswordHistoryCount, ct);

        foreach (var history in recentPasswords)
        {
            if (_passwordHasher.VerifyPassword(request.NewPassword, history.PasswordHash))
                throw new ValidationException("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่าน 3 ครั้งล่าสุด");
        }

        // ตรวจสอบว่าไม่ซ้ำกับรหัสปัจจุบัน
        if (_passwordHasher.VerifyPassword(request.NewPassword, user.PasswordHash))
            throw new ValidationException("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน");

        // บันทึก password เก่าลง history
        await _unitOfWork.PasswordHistory.AddAsync(new TbPasswordHistory
        {
            UserId = user.UserId,
            PasswordHash = user.PasswordHash,
            CreatedAt = DateTime.UtcNow
        }, ct);

        // อัพเดตรหัสผ่านใหม่
        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.LastPasswordChangedDate = DateTime.UtcNow;
        user.FailedLoginAttempts = 0;
        user.LockoutCount = 0;
        user.LockedUntil = null;

        // Mark token เป็น used
        token.IsUsed = true;

        // Revoke ทุก refresh token (บังคับ login ใหม่)
        await _unitOfWork.RefreshTokens.RevokeAllByUserIdAsync(user.UserId, ct);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Password reset completed: {UserId}", user.UserId);

        // ส่งอีเมลยืนยัน (ไม่ block ถ้าส่งไม่ได้)
        var employee = await _unitOfWork.Employees.GetByUserIdAsync(user.UserId, ct);
        var employeeName = employee != null
            ? $"{employee.FirstNameThai} {employee.LastNameThai}"
            : user.Username;

        var confirmHtml = BuildPasswordResetConfirmationEmailHtml(employeeName);
        await _emailService.SendEmailAsync(
            user.Email, employeeName, "RBMS POS - รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว", confirmHtml, ct);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestModel request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        // ตรวจสอบรหัสผ่านเก่า
        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new InvalidCredentialsException("รหัสผ่านเก่าไม่ถูกต้อง");

        // ตรวจสอบ password policy
        ValidatePasswordPolicy(request.NewPassword, user.Username);

        // ตรวจสอบว่ารหัสใหม่ไม่ซ้ำกับรหัสปัจจุบัน
        if (_passwordHasher.VerifyPassword(request.NewPassword, user.PasswordHash))
            throw new ValidationException("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน");

        // ตรวจสอบ password history (ห้ามซ้ำ 3 รหัสล่าสุด)
        var recentPasswords = await _unitOfWork.PasswordHistory.GetRecentByUserIdAsync(
            user.UserId, PasswordHistoryCount, ct);

        foreach (var history in recentPasswords)
        {
            if (_passwordHasher.VerifyPassword(request.NewPassword, history.PasswordHash))
                throw new ValidationException("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่าน 3 ครั้งล่าสุด");
        }

        // บันทึก password เก่าลง history
        await _unitOfWork.PasswordHistory.AddAsync(new TbPasswordHistory
        {
            UserId = user.UserId,
            PasswordHash = user.PasswordHash,
            CreatedAt = DateTime.UtcNow
        }, ct);

        // อัพเดตรหัสผ่านใหม่
        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.LastPasswordChangedDate = DateTime.UtcNow;

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Password changed by user: {UserId}", userId);
    }

    public async Task<bool> VerifyPasswordAsync(Guid userId, string password, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);

        if (user == null || !user.IsActive)
            throw new InvalidCredentialsException("รหัสผ่านไม่ถูกต้อง");

        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
            throw new InvalidCredentialsException("รหัสผ่านไม่ถูกต้อง");

        return true;
    }

    // ========================
    // PIN Code
    // ========================

    public async Task SetupPinAsync(Guid userId, string pinCode, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        if (!string.IsNullOrEmpty(user.PinCodeHash))
            throw new BusinessException("มี PIN อยู่แล้ว กรุณาใช้เปลี่ยน PIN แทน");

        user.PinCodeHash = _passwordHasher.HashPassword(pinCode);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("PIN setup completed: {UserId}", userId);
    }

    public async Task ChangePinAsync(Guid userId, string currentPinCode, string newPinCode, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        if (string.IsNullOrEmpty(user.PinCodeHash))
            throw new BusinessException("ยังไม่มี PIN กรุณาตั้ง PIN ก่อน");

        if (!_passwordHasher.VerifyPassword(currentPinCode, user.PinCodeHash))
            throw new InvalidCredentialsException("รหัส PIN ปัจจุบันไม่ถูกต้อง");

        user.PinCodeHash = _passwordHasher.HashPassword(newPinCode);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("PIN changed: {UserId}", userId);
    }

    public async Task<bool> VerifyPinAsync(Guid userId, string pinCode, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        if (string.IsNullOrEmpty(user.PinCodeHash))
            throw new BusinessException("ยังไม่มี PIN กรุณาตั้ง PIN ก่อน");

        if (!_passwordHasher.VerifyPassword(pinCode, user.PinCodeHash))
            throw new InvalidCredentialsException("รหัส PIN ไม่ถูกต้อง");

        return true;
    }

    public async Task ResetPinAsync(Guid userId, string password, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new EntityNotFoundException("User", userId);

        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
            throw new InvalidCredentialsException("รหัสผ่านไม่ถูกต้อง");

        user.PinCodeHash = null;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("PIN reset via password: {UserId}", userId);
    }

    // ========================
    // Password Validation
    // ========================

    private static void ValidatePasswordPolicy(string password, string username)
    {
        var errors = new List<string>();

        if (password.Length < 8 || password.Length > 128)
            errors.Add("รหัสผ่านต้องมีความยาว 8-128 ตัวอักษร");

        if (!Regex.IsMatch(password, @"[A-Z]"))
            errors.Add("ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว");

        if (!Regex.IsMatch(password, @"[a-z]"))
            errors.Add("ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว");

        if (!Regex.IsMatch(password, @"\d"))
            errors.Add("ต้องมีตัวเลขอย่างน้อย 1 ตัว");

        if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/`~""\\]"))
            errors.Add("ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว");

        if (password.Contains(username, StringComparison.OrdinalIgnoreCase))
            errors.Add("รหัสผ่านต้องไม่มี username อยู่ในรหัสผ่าน");

        if (errors.Count > 0)
            throw new ValidationException(string.Join(", ", errors));
    }

    // ========================
    // Helper Methods
    // ========================

    private static string GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return email;

        var local = parts[0];
        var masked = local.Length <= 2
            ? local[0] + "***"
            : local[..2] + new string('*', Math.Min(local.Length - 2, 5));

        return $"{masked}@{parts[1]}";
    }

    // ========================
    // Email Templates
    // ========================

    private static string BuildOtpEmailHtml(string name, string otpCode)
    {
        return $"""
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light only">
            <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Sarabun', 'Segoe UI', Arial, sans-serif; -webkit-text-size-adjust: 100%;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9;">
                <tr>
                    <td align="center" style="padding: 24px 12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #ea580c; padding: 24px 20px; text-align: center;">
                                    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 4px 0; font-weight: 800;">RBMS POS</h1>
                                    <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.85;">ระบบจัดการร้านอาหาร</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="color: #334155; font-size: 15px; margin: 0 0 6px 0;">สวัสดี <strong>{name}</strong>,</p>
                                    <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5;">คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาใช้รหัส OTP ด้านล่างเพื่อยืนยันตัวตน</p>

                                    <!-- OTP Code -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 12px;">
                                        <tr>
                                            <td style="padding: 16px 14px; text-align: center;">
                                                <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">รหัส OTP</div>
                                                <div style="color: #ea580c; font-size: 32px; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 8px;">{otpCode}</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Expiry Warning -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 10px 14px; text-align: center;">
                                                <p style="color: #e11d48; font-size: 12px; font-weight: 600; margin: 0;">รหัส OTP นี้จะหมดอายุภายใน 3 นาที</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 14px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">อีเมลนี้ส่งอัตโนมัติจากระบบ RBMS POS</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;
    }

    private static string BuildPasswordResetConfirmationEmailHtml(string name)
    {
        return $"""
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light only">
            <meta name="supported-color-schemes" content="light only">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Sarabun', 'Segoe UI', Arial, sans-serif; -webkit-text-size-adjust: 100%;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9;">
                <tr>
                    <td align="center" style="padding: 24px 12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #ea580c; padding: 24px 20px; text-align: center;">
                                    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 4px 0; font-weight: 800;">RBMS POS</h1>
                                    <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.85;">ระบบจัดการร้านอาหาร</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="color: #334155; font-size: 15px; margin: 0 0 6px 0;">สวัสดี <strong>{name}</strong>,</p>
                                    <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5;">รหัสผ่านของคุณได้ถูกเปลี่ยนเรียบร้อยแล้ว</p>

                                    <!-- Success Message -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e; margin-bottom: 12px;">
                                        <tr>
                                            <td style="padding: 14px;">
                                                <p style="color: #15803d; font-size: 13px; font-weight: 600; margin: 0;">รหัสผ่านถูกเปลี่ยนสำเร็จ</p>
                                                <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff1f2; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 10px 14px; text-align: center;">
                                                <p style="color: #e11d48; font-size: 12px; font-weight: 600; margin: 0;">หากคุณไม่ได้ทำรายการนี้ กรุณาติดต่อผู้ดูแลระบบทันที</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8fafc; padding: 14px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">อีเมลนี้ส่งอัตโนมัติจากระบบ RBMS POS</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;
    }
}
