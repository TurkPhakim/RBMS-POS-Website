using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.ShopSettings;

public class UpdateShopSettingsRequestModel
{
    [Required]
    [StringLength(200)]
    public string ShopNameThai { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string ShopNameEnglish { get; set; } = string.Empty;

    [StringLength(200)]
    public string? CompanyNameThai { get; set; }

    [StringLength(200)]
    public string? CompanyNameEnglish { get; set; }

    [Required]
    [StringLength(13)]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก")]
    public string TaxId { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string FoodType { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    public bool HasTwoPeriods { get; set; }

    [Required]
    [StringLength(2000)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(200)]
    [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
    public string? ShopEmail { get; set; }

    [StringLength(200)]
    public string? Facebook { get; set; }

    [StringLength(200)]
    public string? Instagram { get; set; }

    [StringLength(500)]
    public string? Website { get; set; }

    [StringLength(100)]
    public string? LineId { get; set; }

    public List<OperatingHourModel> OperatingHours { get; set; } = new();

    public bool RemoveLogo { get; set; }

    public bool RemoveQrCode { get; set; }
}
