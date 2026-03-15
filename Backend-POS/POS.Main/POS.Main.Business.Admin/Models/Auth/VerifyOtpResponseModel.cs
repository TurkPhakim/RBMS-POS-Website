namespace POS.Main.Business.Admin.Models.Auth;

public class VerifyOtpResponseModel
{
    public string ResetToken { get; set; } = string.Empty;

    public int ExpiresInMinutes { get; set; }
}
