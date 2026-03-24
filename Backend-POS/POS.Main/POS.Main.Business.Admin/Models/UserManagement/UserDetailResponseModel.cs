namespace POS.Main.Business.Admin.Models.UserManagement;

public class UserDetailResponseModel
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsLockedByAdmin { get; set; }
    public DateTime? AutoUnlockDate { get; set; }
    public int FailedLoginAttempts { get; set; }
    public int LockoutCount { get; set; }
    public DateTime? LockedUntil { get; set; }
    public DateTime? LastLoginDate { get; set; }

    // Employee data (read-only)
    public string? FirstNameThai { get; set; }
    public string? LastNameThai { get; set; }
    public string? FirstNameEnglish { get; set; }
    public string? LastNameEnglish { get; set; }
    public string FullNameThai => FirstNameThai != null ? $"{FirstNameThai} {LastNameThai}" : "";
    public string FullNameEnglish => FirstNameEnglish != null ? $"{FirstNameEnglish} {LastNameEnglish}" : "";
    public string? PositionName { get; set; }
    public int? ImageFileId { get; set; }
    public string? Phone { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByName { get; set; }
    public string? UpdatedByName { get; set; }
}
