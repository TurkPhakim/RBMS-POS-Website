namespace POS.Main.Business.Admin.Models.UserManagement;

public class UserListResponseModel
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsLockedByAdmin { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockedUntil { get; set; }
    public DateTime? LastLoginDate { get; set; }

    // Employee data
    public int? EmployeeId { get; set; }
    public string? FirstNameThai { get; set; }
    public string? LastNameThai { get; set; }
    public string? FirstNameEnglish { get; set; }
    public string? LastNameEnglish { get; set; }
    public string FullNameThai => FirstNameThai != null ? $"{FirstNameThai} {LastNameThai}" : "";
    public string FullNameEnglish => FirstNameEnglish != null ? $"{FirstNameEnglish} {LastNameEnglish}" : "";
    public int? PositionId { get; set; }
    public string? PositionName { get; set; }
    public int? ImageFileId { get; set; }
    public string? Phone { get; set; }
}
