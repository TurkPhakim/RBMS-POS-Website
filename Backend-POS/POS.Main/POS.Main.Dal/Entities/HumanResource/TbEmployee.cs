using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbEmployee : BaseEntity
{
    public int EmployeeId { get; set; }

    public ETitle? Title { get; set; }

    public string FirstNameThai { get; set; } = string.Empty;

    public string LastNameThai { get; set; } = string.Empty;

    public string FirstNameEnglish { get; set; } = string.Empty;

    public string LastNameEnglish { get; set; } = string.Empty;

    public string? Nickname { get; set; }

    public EGender Gender { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? NationalId { get; set; }

    public string? BankAccountNumber { get; set; }

    public string? BankName { get; set; }

    public ENationality? Nationality { get; set; }

    public EReligion? Religion { get; set; }

    public string? LineId { get; set; }

    public int? PositionId { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public bool IsFullTime { get; set; } = true;

    public decimal? Salary { get; set; }

    public decimal? HourlyRate { get; set; }

    public int? ImageFileId { get; set; }
    public virtual TbFile? ImageFile { get; set; }

    public bool IsActive { get; set; } = true;

    public Guid? UserId { get; set; }

    public virtual TbUser? User { get; set; }

    public virtual TbmPosition? Position { get; set; }

    public virtual ICollection<TbEmployeeAddress> Addresses { get; set; } = new List<TbEmployeeAddress>();

    public virtual ICollection<TbEmployeeEducation> Educations { get; set; } = new List<TbEmployeeEducation>();

    public virtual ICollection<TbEmployeeWorkHistory> WorkHistories { get; set; } = new List<TbEmployeeWorkHistory>();
}
