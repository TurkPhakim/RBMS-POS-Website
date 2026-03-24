using POS.Main.Core.Enums;

namespace POS.Main.Business.HumanResource.Models;

public class EmployeeResponseModel
{
    public int EmployeeId { get; set; }
    public ETitle? Title { get; set; }
    public string? TitleName => Title?.ToString();
    public string FirstNameThai { get; set; } = string.Empty;
    public string LastNameThai { get; set; } = string.Empty;
    public string FirstNameEnglish { get; set; } = string.Empty;
    public string LastNameEnglish { get; set; } = string.Empty;
    public string FullNameThai => $"{FirstNameThai} {LastNameThai}";
    public string FullNameEnglish => $"{FirstNameEnglish} {LastNameEnglish}";
    public string? Nickname { get; set; }
    public EGender Gender { get; set; }
    public string GenderName => Gender.ToString();
    public DateTime? DateOfBirth { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? NationalId { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public ENationality? Nationality { get; set; }
    public string? NationalityName => Nationality?.ToString();
    public EReligion? Religion { get; set; }
    public string? ReligionName => Religion?.ToString();
    public string? LineId { get; set; }
    public int? PositionId { get; set; }
    public string? PositionName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsFullTime { get; set; }
    public decimal? Salary { get; set; }
    public decimal? HourlyRate { get; set; }
    public int? ImageFileId { get; set; }
    public string? ImageFileName { get; set; }
    public bool IsActive { get; set; }
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public bool HasPinCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    public List<EmployeeAddressResponseModel> Addresses { get; set; } = new();
    public List<EmployeeEducationResponseModel> Educations { get; set; } = new();
    public List<EmployeeWorkHistoryResponseModel> WorkHistories { get; set; } = new();
}
