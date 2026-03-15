namespace POS.Main.Business.Admin.Models.ShopSettings;

public class WelcomeShopInfoResponseModel
{
    public string ShopNameThai { get; set; } = string.Empty;
    public string ShopNameEnglish { get; set; } = string.Empty;
    public string FoodType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public int? LogoFileId { get; set; }
    public bool HasTwoPeriods { get; set; }
    public List<OperatingHourModel> OperatingHours { get; set; } = new();
}
