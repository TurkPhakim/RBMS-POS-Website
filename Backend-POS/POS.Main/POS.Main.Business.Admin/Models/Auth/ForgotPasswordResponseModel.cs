namespace POS.Main.Business.Admin.Models.Auth;

public class ForgotPasswordResponseModel
{
    public string MaskedEmail { get; set; } = string.Empty;

    public int OtpExpiresInSeconds { get; set; }
}
