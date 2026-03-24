namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerAuthRequestModel
{
    public string QrToken { get; set; } = string.Empty;
    public string? DeviceFingerprint { get; set; }
}
