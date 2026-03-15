using POS.Main.Core.Enums;

namespace POS.Main.Business.HumanResource.Models;

public class EmployeeAddressResponseModel
{
    public int AddressId { get; set; }
    public int EmployeeId { get; set; }
    public EAddressType AddressType { get; set; }
    public string AddressTypeName => AddressType.ToString();
    public string? HouseNumber { get; set; }
    public string? Building { get; set; }
    public string? Moo { get; set; }
    public string? Soi { get; set; }
    public string? Yaek { get; set; }
    public string? Road { get; set; }
    public string? SubDistrict { get; set; }
    public string? District { get; set; }
    public string? Province { get; set; }
    public string? PostalCode { get; set; }
}
