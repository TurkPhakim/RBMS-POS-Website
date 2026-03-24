namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerAuthResponseModel
{
    public string SessionToken { get; set; } = string.Empty;
    public int TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string? Nickname { get; set; }
    public string ShopNameThai { get; set; } = string.Empty;
    public string? ShopNameEnglish { get; set; }
    public int? LogoFileId { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ShopEmail { get; set; }
    public string? Facebook { get; set; }
    public string? Instagram { get; set; }
    public string? Website { get; set; }

    // ข้อมูลชำระเงิน
    public int? PaymentQrCodeFileId { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? AccountName { get; set; }

    // WiFi
    public string? WifiSsid { get; set; }
    public string? WifiPassword { get; set; }
}
