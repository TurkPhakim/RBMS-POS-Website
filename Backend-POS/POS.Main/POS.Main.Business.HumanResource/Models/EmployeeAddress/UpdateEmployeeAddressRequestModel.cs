using POS.Main.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.HumanResource.Models.EmployeeAddress;

public class UpdateEmployeeAddressRequestModel
{
    [Required(ErrorMessage = "Address type is required")]
    public EAddressType AddressType { get; set; }

    [StringLength(50)]
    public string? HouseNumber { get; set; }

    [StringLength(100)]
    public string? Building { get; set; }

    [StringLength(20)]
    public string? Moo { get; set; }

    [StringLength(100)]
    public string? Soi { get; set; }

    [StringLength(100)]
    public string? Yaek { get; set; }

    [StringLength(100)]
    public string? Road { get; set; }

    [StringLength(100)]
    public string? SubDistrict { get; set; }

    [StringLength(100)]
    public string? District { get; set; }

    [StringLength(100)]
    public string? Province { get; set; }

    [StringLength(10)]
    public string? PostalCode { get; set; }
}
