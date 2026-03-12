using POS.Main.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.HumanResource.Models;

/// <summary>
/// Request model for updating an existing employee
/// </summary>
public class UpdateEmployeeRequestModel
{
    /// <summary>
    /// Employee title (optional)
    /// </summary>
    /// <example>Mr.</example>
    [StringLength(20, ErrorMessage = "Title cannot exceed 20 characters")]
    public string? Title { get; set; }

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
    /// Nickname (optional)
    /// </summary>
    /// <example>Som</example>
    [StringLength(50, ErrorMessage = "Nickname cannot exceed 50 characters")]
    public string? Nickname { get; set; }

    /// <summary>
    /// Gender
    /// </summary>
    /// <example>Male</example>
    [Required(ErrorMessage = "Gender is required")]
    public EGender Gender { get; set; }

    /// <summary>
    /// Date of birth (optional)
    /// </summary>
    /// <example>1990-01-15</example>
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
    /// National ID (optional)
    /// </summary>
    /// <example>1234567890123</example>
    [StringLength(13, ErrorMessage = "National ID must be 13 characters")]
    public string? NationalId { get; set; }

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

    /// <summary>
    /// Employment status
    /// </summary>
    /// <example>Active</example>
    [Required(ErrorMessage = "Employment status is required")]
    public EEmploymentStatus EmploymentStatus { get; set; }

    /// <summary>
    /// Position ID (FK to TbmPosition, optional)
    /// </summary>
    public int? PositionId { get; set; }

    /// <summary>
    /// Phone number (optional)
    /// </summary>
    /// <example>0812345678</example>
    [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
    public string? Phone { get; set; }

    /// <summary>
    /// Email address (optional)
    /// </summary>
    /// <example>somchai@example.com</example>
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? Email { get; set; }

    /// <summary>
    /// Salary (optional)
    /// </summary>
    /// <example>15000.00</example>
    [Range(0, 9999999999.99, ErrorMessage = "Salary must be between 0 and 9,999,999,999.99")]
    public decimal? Salary { get; set; }

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
}
