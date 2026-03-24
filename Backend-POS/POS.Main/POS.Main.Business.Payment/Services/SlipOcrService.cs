using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Payment.Interfaces;
using Tesseract;

namespace POS.Main.Business.Payment.Services;

public class SlipOcrService : ISlipOcrService
{
    private readonly ILogger<SlipOcrService> _logger;
    private readonly string _tessDataPath;

    public SlipOcrService(ILogger<SlipOcrService> logger)
    {
        _logger = logger;
        _tessDataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata");
    }

    public async Task<decimal?> ExtractAmountAsync(Stream imageStream, CancellationToken ct = default)
    {
        // Check if tessdata exists
        if (!Directory.Exists(_tessDataPath))
        {
            _logger.LogWarning("tessdata directory not found at {Path}, OCR disabled", _tessDataPath);
            return null;
        }

        try
        {
            // Read image bytes
            using var ms = new MemoryStream();
            await imageStream.CopyToAsync(ms, ct);
            var imageBytes = ms.ToArray();

            // OCR with Tesseract
            var text = await Task.Run(() =>
            {
                using var engine = new TesseractEngine(_tessDataPath, "eng+tha", EngineMode.Default);
                using var pix = Pix.LoadFromMemory(imageBytes);
                using var page = engine.Process(pix);
                return page.GetText();
            }, ct);

            _logger.LogInformation("OCR extracted text length: {Length}", text.Length);

            // Parse amount from OCR text
            return ParseAmount(text);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OCR processing failed");
            return null;
        }
    }

    private decimal? ParseAmount(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        // Common Thai bank slip patterns for transfer amount
        // Pattern: "จำนวนเงิน" / "Amount" / "THB" followed by a number
        var patterns = new[]
        {
            @"(?:จำนวนเงิน|จํานวนเงิน|Amount|ยอดเงิน|ยอดโอน)\s*[:：]?\s*([\d,]+\.?\d*)",
            @"(?:THB|฿)\s*([\d,]+\.?\d*)",
            @"([\d,]+\.?\d*)\s*(?:THB|฿|บาท|baht)",
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var amountStr = match.Groups[1].Value.Replace(",", "");
                if (decimal.TryParse(amountStr, out var amount) && amount > 0)
                {
                    _logger.LogInformation("OCR parsed amount: {Amount} from pattern: {Pattern}", amount, pattern);
                    return amount;
                }
            }
        }

        // Fallback: find the largest number in text (likely the transfer amount)
        var numberMatches = Regex.Matches(text, @"([\d,]+\.\d{2})");
        decimal maxAmount = 0;
        foreach (Match match in numberMatches)
        {
            var amountStr = match.Groups[1].Value.Replace(",", "");
            if (decimal.TryParse(amountStr, out var amount) && amount > maxAmount)
                maxAmount = amount;
        }

        if (maxAmount > 0)
        {
            _logger.LogInformation("OCR fallback parsed max amount: {Amount}", maxAmount);
            return maxAmount;
        }

        _logger.LogWarning("OCR could not parse any amount from text");
        return null;
    }
}
