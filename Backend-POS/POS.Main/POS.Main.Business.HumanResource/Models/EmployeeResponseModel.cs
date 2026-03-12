using POS.Main.Core.Enums;

namespace POS.Main.Business.HumanResource.Models;

/// <summary>
/// Response model for employee data
/// </summary>
public class EmployeeResponseModel
{
    /// <summary>
    /// Employee unique identifier
    /// </summary>
    /// <example>1</example>
    public int EmployeeId { get; set; }

    /// <summary>
    /// Employee title
    /// </summary>
    /// <example>Mr.</example>
    public string? Title { get; set; }

    /// <summary>
    /// First name in Thai
    /// </summary>
    /// <example>สมชาย</example>
    public string FirstNameThai { get; set; } = string.Empty;

    /// <summary>
    /// Last name in Thai
    /// </summary>
    /// <example>ใจดี</example>
    public string LastNameThai { get; set; } = string.Empty;

    /// <summary>
    /// First name in English
    /// </summary>
    /// <example>Somchai</example>
    public string FirstNameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Last name in English
    /// </summary>
    /// <example>Jaidee</example>
    public string LastNameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Full name in Thai (for display)
    /// </summary>
    /// <example>สมชาย ใจดี</example>
    public string FullNameThai => $"{FirstNameThai} {LastNameThai}";

    /// <summary>
    /// Full name in English (for display)
    /// </summary>
    /// <example>Somchai Jaidee</example>
    public string FullNameEnglish => $"{FirstNameEnglish} {LastNameEnglish}";

    /// <summary>
    /// Nickname
    /// </summary>
    /// <example>Som</example>
    public string? Nickname { get; set; }

    /// <summary>
    /// Gender
    /// </summary>
    /// <example>Male</example>
    public EGender Gender { get; set; }

    /// <summary>
    /// Gender name (for display)
    /// </summary>
    /// <example>Male</example>
    public string GenderName => Gender.ToString();

    /// <summary>
    /// Date of birth
    /// </summary>
    /// <example>1990-01-15</example>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Start date
    /// </summary>
    /// <example>2024-01-01</example>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date
    /// </summary>
    /// <example>2025-12-31</example>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// National ID
    /// </summary>
    /// <example>1234567890123</example>
    public string? NationalId { get; set; }

    /// <summary>
    /// Bank account number
    /// </summary>
    /// <example>1234567890</example>
    public string? BankAccountNumber { get; set; }

    /// <summary>
    /// Bank name
    /// </summary>
    /// <example>Bangkok Bank</example>
    public string? BankName { get; set; }

    /// <summary>
    /// Employment status
    /// </summary>
    /// <example>Active</example>
    public EEmploymentStatus EmploymentStatus { get; set; }

    /// <summary>
    /// Employment status name (for display)
    /// </summary>
    /// <example>Active</example>
    public string EmploymentStatusName => EmploymentStatus.ToString();

    /// <summary>
    /// Position ID (FK to TbmPosition)
    /// </summary>
    public int? PositionId { get; set; }

    /// <summary>
    /// Position name (for display)
    /// </summary>
    public string? PositionName { get; set; }

    /// <summary>
    /// Phone number
    /// </summary>
    /// <example>0812345678</example>
    public string? Phone { get; set; }

    /// <summary>
    /// Email address
    /// </summary>
    /// <example>somchai@example.com</example>
    public string? Email { get; set; }

    /// <summary>
    /// Salary
    /// </summary>
    /// <example>15000.00</example>
    public decimal? Salary { get; set; }

    /// <summary>
    /// Image file ID (reference to TbFile)
    /// </summary>
    public int? ImageFileId { get; set; }

    /// <summary>
    /// Image file name (for display)
    /// </summary>
    public string? ImageFileName { get; set; }

    /// <summary>
    /// Indicates if the employee is active in the system
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; }

    /// <summary>
    /// User ID linked to this employee
    /// </summary>
    /// <example>00000000-0000-0000-0000-000000000000</example>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Username of linked user (for display)
    /// </summary>
    /// <example>somchai.j</example>
    public string? Username { get; set; }

    /// <summary>
    /// Creation timestamp (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Last update timestamp (UTC)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// User who created this record
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// User who last updated this record
    /// </summary>
    public string? UpdatedBy { get; set; }
}
