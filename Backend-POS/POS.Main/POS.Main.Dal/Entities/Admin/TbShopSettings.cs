namespace POS.Main.Dal.Entities;

public class TbShopSettings : BaseEntity
{
    public int ShopSettingsId { get; set; }

    // ข้อมูลร้านค้า
    public string ShopNameThai { get; set; } = string.Empty;
    public string ShopNameEnglish { get; set; } = string.Empty;
    public string? CompanyNameThai { get; set; }
    public string? CompanyNameEnglish { get; set; }
    public string TaxId { get; set; } = string.Empty;
    public string FoodType { get; set; } = string.Empty;
    public string? Description { get; set; }

    // โลโก้
    public int? LogoFileId { get; set; }
    public virtual TbFile? LogoFile { get; set; }

    // เวลาทำการ
    public bool HasTwoPeriods { get; set; }

    // ที่อยู่และช่องทางติดต่อ
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? ShopEmail { get; set; }
    public string? Website { get; set; }
    public string? LineId { get; set; }

    // QR Code ชำระเงิน
    public int? PaymentQrCodeFileId { get; set; }
    public virtual TbFile? PaymentQrCodeFile { get; set; }

    // Navigation
    public virtual ICollection<TbShopOperatingHour> OperatingHours { get; set; } = new List<TbShopOperatingHour>();
}
