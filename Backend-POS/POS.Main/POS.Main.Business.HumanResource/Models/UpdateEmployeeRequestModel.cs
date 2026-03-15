using POS.Main.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.HumanResource.Models;

/// <summary>
/// Request model for updating an existing employee
/// </summary>
public class UpdateEmployeeRequestModel
{
    /// <summary>
    /// Employee title
    /// </summary>
    /// <example>Mr</example>
    [Required(ErrorMessage = "Title is required")]
    public ETitle? Title { get; set; }

    /// <summary>
    /// First name in Thai
    /// </summary>
    /// <example>สมชาย</example>
    [Required(ErrorMessage = "Thai first name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Thai first name must be between 2 and 100 characters")]
    public string FirstNameThai { get; set; } = string.Empty;

    /// <summary>
    /// Last name in Thai
    /// </summary>
    /// <example>ใจดี</example>
    [Required(ErrorMessage = "Thai last name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Thai last name must be between 2 and 100 characters")]
    public string LastNameThai { get; set; } = string.Empty;

    /// <summary>
    /// First name in English
    /// </summary>
    /// <example>Somchai</example>
    [Required(ErrorMessage = "English first name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "English first name must be between 2 and 100 characters")]
    public string FirstNameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Last name in English
    /// </summary>
    /// <example>Jaidee</example>
    [Required(ErrorMessage = "English last name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "English last name must be between 2 and 100 characters")]
    public string LastNameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Nickname
    /// </summary>
    /// <example>Som</example>
    [Required(ErrorMessage = "Nickname is required")]
    [StringLength(50, ErrorMessage = "Nickname cannot exceed 50 characters")]
    public string Nickname { get; set; } = string.Empty;

    /// <summary>
    /// Gender
    /// </summary>
    /// <example>Male</example>
    [Required(ErrorMessage = "Gender is required")]
    public EGender Gender { get; set; }

    /// <summary>
    /// Date of birth
    /// </summary>
    /// <example>1990-01-15</example>
    [Required(ErrorMessage = "Date of birth is required")]
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Start date (required)
    /// </summary>
    /// <example>2024-01-01</example>
    [Required(ErrorMessage = "Start date is required")]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date (optional)
    /// </summary>
    /// <example>2025-12-31</example>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// National ID
    /// </summary>
    /// <example>1234567890123</example>
    [Required(ErrorMessage = "National ID is required")]
    [StringLength(13, ErrorMessage = "National ID must be 13 characters")]
    public string NationalId { get; set; } = string.Empty;

    /// <summary>
    /// Bank account number (optional)
    /// </summary>
    /// <example>1234567890</example>
    [StringLength(20, ErrorMessage = "Bank account number cannot exceed 20 characters")]
    public string? BankAccountNumber { get; set; }

    /// <summary>
    /// Bank name (optional)
    /// </summary>
    /// <example>Bangkok Bank</example>
    [StringLength(100, ErrorMessage = "Bank name cannot exceed 100 characters")]
    public string? BankName { get; set; }

    [Required(ErrorMessage = "Nationality is required")]
    public ENationality? Nationality { get; set; }

    [Required(ErrorMessage = "Religion is required")]
    public EReligion? Religion { get; set; }

    [Required(ErrorMessage = "Line ID is required")]
    [StringLength(50, ErrorMessage = "Line ID cannot exceed 50 characters")]
    public string LineId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Position is required")]
    public int? PositionId { get; set; }

    /// <summary>
    /// Phone number
    /// </summary>
    /// <example>0812345678</example>
    [Required(ErrorMessage = "Phone number is required")]
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Email address
    /// </summary>
    /// <example>somchai@example.com</example>
    [Required(ErrorMessage = "Email is required")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Full-time or Part-time employee
    /// </summary>
    /// <example>true</example>
    public bool IsFullTime { get; set; } = true;

    /// <summary>
    /// Monthly salary (for full-time employees)
    /// </summary>
    /// <example>15000.00</example>
    [Range(0, 9999999999.99, ErrorMessage = "Salary must be between 0 and 9,999,999,999.99")]
    public decimal? Salary { get; set; }

    /// <summary>
    /// Hourly rate (for part-time employees)
    /// </summary>
    /// <example>100.00</example>
    [Range(0, 9999999999.99, ErrorMessage = "Hourly rate must be between 0 and 9,999,999,999.99")]
    public decimal? HourlyRate { get; set; }

    /// <summary>
    /// Indicates if the employee is active in the system
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// User ID linked to this employee (optional)
    /// </summary>
    /// <example>00000000-0000-0000-0000-000000000000</example>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Set to true to remove the existing profile image
    /// </summary>
    public bool RemoveImage { get; set; }
}
