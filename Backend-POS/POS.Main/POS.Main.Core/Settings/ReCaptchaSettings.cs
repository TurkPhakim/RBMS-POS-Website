namespace POS.Main.Core.Settings;

public class ReCaptchaSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
}
