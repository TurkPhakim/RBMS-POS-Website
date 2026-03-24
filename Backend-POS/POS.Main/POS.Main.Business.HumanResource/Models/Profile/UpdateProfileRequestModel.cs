using System.ComponentModel.DataAnnotations;
using POS.Main.Business.HumanResource.Models.EmployeeAddress;
using POS.Main.Business.HumanResource.Models.EmployeeEducation;
using POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;

namespace POS.Main.Business.HumanResource.Models.Profile;

public class UpdateProfileRequestModel
{
    [StringLength(50)]
    public string? Username { get; set; }

    [StringLength(50)]
    public string? LineId { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    [StringLength(20)]
    public string? BankAccountNumber { get; set; }

    public DateTime? EndDate { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    public bool RemoveImage { get; set; }

    public List<CreateEmployeeAddressRequestModel>? Addresses { get; set; }

    public List<CreateEmployeeEducationRequestModel>? Educations { get; set; }

    public List<CreateEmployeeWorkHistoryRequestModel>? WorkHistories { get; set; }
}
