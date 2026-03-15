using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Settings;
using System.Text.Json;

namespace POS.Main.Business.Admin.Services;

public class ReCaptchaService : IReCaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly ReCaptchaSettings _settings;
    private readonly ILogger<ReCaptchaService> _logger;

    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public ReCaptchaService(HttpClient httpClient, IOptions<ReCaptchaSettings> options, ILogger<ReCaptchaService> logger)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task ValidateAsync(string token, CancellationToken ct = default)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            _logger.LogWarning("reCAPTCHA validation skipped (Enabled={Enabled}, SecretKey={HasKey})",
                _settings.Enabled, !string.IsNullOrWhiteSpace(_settings.SecretKey));
            return;
        }

        if (string.IsNullOrWhiteSpace(token))
            throw new ValidationException("กรุณายืนยัน reCAPTCHA ก่อนเข้าสู่ระบบ");

        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["secret"] = _settings.SecretKey,
            ["response"] = token
        });

        var response = await _httpClient.PostAsync(VerifyUrl, content, ct);
        var json = await response.Content.ReadAsStringAsync(ct);

        using var doc = JsonDocument.Parse(json);
        var success = doc.RootElement.GetProperty("success").GetBoolean();

        if (!success)
        {
            _logger.LogWarning("reCAPTCHA verification failed. Response: {Response}", json);
            throw new ValidationException("การยืนยัน reCAPTCHA ล้มเหลว กรุณาลองใหม่");
        }
    }
}
