using POS.Main.Core.Enums;

namespace POS.Main.Business.Admin.Models.ShopSettings;

public class ShopSettingsResponseModel
{
    public int ShopSettingsId { get; set; }
    public string ShopNameThai { get; set; } = string.Empty;
    public string ShopNameEnglish { get; set; } = string.Empty;
    public string? CompanyNameThai { get; set; }
    public string? CompanyNameEnglish { get; set; }
    public string TaxId { get; set; } = string.Empty;
    public string FoodType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? LogoFileId { get; set; }
    public string? LogoFileName { get; set; }
    public bool HasTwoPeriods { get; set; }
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ShopEmail { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Website { get; set; }
    public string? LineId { get; set; }
    public int? PaymentQrCodeFileId { get; set; }
    public string? PaymentQrCodeFileName { get; set; }
    public List<OperatingHourModel> OperatingHours { get; set; } = new();

    // Audit info
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedByName { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
