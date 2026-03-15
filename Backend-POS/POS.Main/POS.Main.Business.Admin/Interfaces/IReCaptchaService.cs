namespace POS.Main.Business.Admin.Interfaces;

public interface IReCaptchaService
{
    Task ValidateAsync(string token, CancellationToken ct = default);
}
