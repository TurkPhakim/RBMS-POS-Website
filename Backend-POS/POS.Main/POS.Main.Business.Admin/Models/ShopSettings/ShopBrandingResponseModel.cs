namespace POS.Main.Business.Admin.Models.ShopSettings;

public class ShopBrandingResponseModel
{
    public string ShopNameThai { get; set; } = string.Empty;
    public string ShopNameEnglish { get; set; } = string.Empty;
    public int? LogoFileId { get; set; }
    public bool HasTwoPeriods { get; set; }
}
