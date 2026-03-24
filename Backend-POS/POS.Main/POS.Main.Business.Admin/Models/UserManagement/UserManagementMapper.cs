using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Models.UserManagement;

public static class UserManagementMapper
{
    public static UserListResponseModel ToListResponse(TbUser user)
    {
        var employee = user.Employee;
        return new UserListResponseModel
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            IsLockedByAdmin = user.IsLockedByAdmin,
            FailedLoginAttempts = user.FailedLoginAttempts,
            LockedUntil = user.LockedUntil,
            LastLoginDate = user.LastLoginDate,
            EmployeeId = employee?.EmployeeId,
            FirstNameThai = employee?.FirstNameThai,
            LastNameThai = employee?.LastNameThai,
            FirstNameEnglish = employee?.FirstNameEnglish,
            LastNameEnglish = employee?.LastNameEnglish,
            PositionId = employee?.PositionId,
            PositionName = employee?.Position?.PositionName,
            ImageFileId = employee?.ImageFileId,
            Phone = employee?.Phone,
        };
    }

    public static UserDetailResponseModel ToDetailResponse(TbUser user)
    {
        var employee = user.Employee;
        return new UserDetailResponseModel
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            IsActive = user.IsActive,
            IsLockedByAdmin = user.IsLockedByAdmin,
            AutoUnlockDate = user.AutoUnlockDate,
            FailedLoginAttempts = user.FailedLoginAttempts,
            LockoutCount = user.LockoutCount,
            LockedUntil = user.LockedUntil,
            LastLoginDate = user.LastLoginDate,
            FirstNameThai = employee?.FirstNameThai,
            LastNameThai = employee?.LastNameThai,
            FirstNameEnglish = employee?.FirstNameEnglish,
            LastNameEnglish = employee?.LastNameEnglish,
            PositionName = employee?.Position?.PositionName,
            ImageFileId = employee?.ImageFileId,
            Phone = employee?.Phone,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            CreatedByName = user.CreatedByEmployee?.Nickname ?? user.CreatedBy?.ToString(),
            UpdatedByName = user.UpdatedByEmployee?.Nickname ?? user.UpdatedBy?.ToString(),
        };
    }
}
