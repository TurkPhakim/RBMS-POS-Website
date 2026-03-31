using System.Diagnostics;
using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Payment;

namespace POS.Main.Business.Payment.Services;

public class SlipOcrService : ISlipOcrService
{
    private readonly ILogger<SlipOcrService> _logger;

    // Thai month abbreviations → month number
    private static readonly Dictionary<string, int> ThaiMonthMap = new(StringComparer.OrdinalIgnoreCase)
    {
        { "ม.ค.", 1 }, { "มค", 1 }, { "มกราคม", 1 },
        { "ก.พ.", 2 }, { "กพ", 2 }, { "กุมภาพันธ์", 2 },
        { "มี.ค.", 3 }, { "มีค", 3 }, { "มีนาคม", 3 },
        { "เม.ย.", 4 }, { "เมย", 4 }, { "เมษายน", 4 },
        { "พ.ค.", 5 }, { "พค", 5 }, { "พฤษภาคม", 5 },
        { "มิ.ย.", 6 }, { "มิย", 6 }, { "มิถุนายน", 6 },
        { "ก.ค.", 7 }, { "กค", 7 }, { "กรกฎาคม", 7 },
        { "ส.ค.", 8 }, { "สค", 8 }, { "สิงหาคม", 8 },
        { "ก.ย.", 9 }, { "กย", 9 }, { "กันยายน", 9 },
        { "ต.ค.", 10 }, { "ตค", 10 }, { "ตุลาคม", 10 },
        { "พ.ย.", 11 }, { "พย", 11 }, { "พฤศจิกายน", 11 },
        { "ธ.ค.", 12 }, { "ธค", 12 }, { "ธันวาคม", 12 },
    };

    public SlipOcrService(ILogger<SlipOcrService> logger)
    {
        _logger = logger;
    }

    public async Task<SlipOcrResultModel> ExtractSlipDataAsync(Stream imageStream, CancellationToken ct = default)
    {
        var result = new SlipOcrResultModel();
        string? tempFile = null;

        try
        {
            // Save image to temp file for Tesseract CLI
            tempFile = Path.Combine(Path.GetTempPath(), $"slip-ocr-{Guid.NewGuid()}.png");
            await using (var fs = File.Create(tempFile))
            {
                await imageStream.CopyToAsync(fs, ct);
            }

            var text = await RunTesseractCliAsync(tempFile, ct);

            _logger.LogInformation("OCR extracted text length: {Length}", text.Length);

            result.Amount = ParseAmount(text);
            result.TransferDate = ParseDate(text);
            result.AccountNumber = ParseAccountNumber(text);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OCR processing failed");
            return result;
        }
        finally
        {
            if (tempFile != null && File.Exists(tempFile))
            {
                try { File.Delete(tempFile); } catch { /* cleanup */ }
            }
        }
    }

    private async Task<string> RunTesseractCliAsync(string imagePath, CancellationToken ct)
    {
        using var process = new Process();
        process.StartInfo = new ProcessStartInfo
        {
            FileName = "tesseract",
            Arguments = $"\"{imagePath}\" stdout -l eng+tha --psm 4",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        process.Start();

        var output = await process.StandardOutput.ReadToEndAsync(ct);
        var error = await process.StandardError.ReadToEndAsync(ct);

        await process.WaitForExitAsync(ct);

        if (process.ExitCode != 0)
        {
            _logger.LogWarning("Tesseract CLI exited with code {ExitCode}: {Error}", process.ExitCode, error);
        }

        return output;
    }

    private decimal? ParseAmount(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

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

        // Fallback: find the largest decimal number
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

    private DateTime? ParseDate(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        // Pattern 1: Thai format "28 มี.ค. 69" or "28 มี.ค. 2569"
        var thaiDatePattern = @"(\d{1,2})\s*(ม\.ค\.|มค|มกราคม|ก\.พ\.|กพ|กุมภาพันธ์|มี\.ค\.|มีค|มีนาคม|เม\.ย\.|เมย|เมษายน|พ\.ค\.|พค|พฤษภาคม|มิ\.ย\.|มิย|มิถุนายน|ก\.ค\.|กค|กรกฎาคม|ส\.ค\.|สค|สิงหาคม|ก\.ย\.|กย|กันยายน|ต\.ค\.|ตค|ตุลาคม|พ\.ย\.|พย|พฤศจิกายน|ธ\.ค\.|ธค|ธันวาคม)\s*(\d{2,4})";
        var thaiMatch = Regex.Match(text, thaiDatePattern);
        if (thaiMatch.Success)
        {
            var day = int.Parse(thaiMatch.Groups[1].Value);
            var monthStr = thaiMatch.Groups[2].Value;
            var yearRaw = int.Parse(thaiMatch.Groups[3].Value);

            if (ThaiMonthMap.TryGetValue(monthStr, out var month))
            {
                var year = ConvertToGregorianYear(yearRaw);
                try
                {
                    var date = new DateTime(year, month, day);
                    _logger.LogInformation("OCR parsed Thai date: {Date}", date.ToString("yyyy-MM-dd"));
                    return date;
                }
                catch { /* invalid date */ }
            }
        }

        // Pattern 2: Numeric format "28/03/2026" or "28/03/69" or "2026-03-28"
        var numericPatterns = new[]
        {
            @"(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})",  // DD/MM/YYYY or DD/MM/YY
            @"(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})",     // YYYY-MM-DD
        };

        foreach (var pattern in numericPatterns)
        {
            var matches = Regex.Matches(text, pattern);
            foreach (Match match in matches)
            {
                int day, month, yearRaw;

                if (pattern.StartsWith(@"(\d{4})"))
                {
                    // YYYY-MM-DD
                    yearRaw = int.Parse(match.Groups[1].Value);
                    month = int.Parse(match.Groups[2].Value);
                    day = int.Parse(match.Groups[3].Value);
                }
                else
                {
                    // DD/MM/YYYY
                    day = int.Parse(match.Groups[1].Value);
                    month = int.Parse(match.Groups[2].Value);
                    yearRaw = int.Parse(match.Groups[3].Value);
                }

                if (month < 1 || month > 12 || day < 1 || day > 31)
                    continue;

                var year = ConvertToGregorianYear(yearRaw);

                // ข้ามปีที่ไม่สมเหตุสมผล (เช่น reference numbers ที่ดูเหมือนวันที่)
                if (year < 2020 || year > 2030)
                    continue;

                try
                {
                    var date = new DateTime(year, month, day);
                    _logger.LogInformation("OCR parsed numeric date: {Date}", date.ToString("yyyy-MM-dd"));
                    return date;
                }
                catch { /* invalid date */ }
            }
        }

        // Pattern 3: English month "28 Mar 2026" or "28 Mar 26"
        var engMatch = Regex.Match(text, @"(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*(\d{2,4})", RegexOptions.IgnoreCase);
        if (engMatch.Success)
        {
            var day = int.Parse(engMatch.Groups[1].Value);
            var monthStr = engMatch.Groups[2].Value;
            var yearRaw = int.Parse(engMatch.Groups[3].Value);

            if (DateTime.TryParseExact(monthStr, "MMM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var monthDate))
            {
                var year = ConvertToGregorianYear(yearRaw);
                try
                {
                    var date = new DateTime(year, monthDate.Month, day);
                    _logger.LogInformation("OCR parsed English date: {Date}", date.ToString("yyyy-MM-dd"));
                    return date;
                }
                catch { /* invalid date */ }
            }
        }

        _logger.LogWarning("OCR could not parse any date from text");
        return null;
    }

    private string? ParseAccountNumber(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        // Pattern 1: Label followed by account number
        // "เลขที่บัญชี", "A/C", "Account" followed by digits/dashes
        var labelPatterns = new[]
        {
            @"(?:เลขที่บัญชี|เลขบัญชี|A/C|Account\s*(?:No\.?)?)\s*[:：]?\s*([\dx\-\s]{7,})",
        };

        foreach (var pattern in labelPatterns)
        {
            var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var raw = match.Groups[1].Value.Trim();
                var cleaned = CleanAccountNumber(raw);
                if (cleaned.Length >= 7)
                {
                    _logger.LogInformation("OCR parsed account from label: {Account}", cleaned);
                    return cleaned;
                }
            }
        }

        // Pattern 2: Masked account "xxx-x-x4400-x" or "XXX-X-X4400-X"
        // OCR อาจอ่าน x เป็น ×, *, X, หรืออักษรอื่น
        // สลิปมี 2 บัญชี (ผู้โอน + ปลายทาง) — เอาตัวสุดท้าย (ปลายทางอยู่ด้านล่าง)
        var maskedMatches = Regex.Matches(text, @"[xX×\*\d]{3}[\-\s][xX×\*\d]{1,4}[\-\s][xX×\*\d]{4,6}[\-\s][xX×\*\d]{1,2}");
        if (maskedMatches.Count > 0)
        {
            var lastMatch = maskedMatches[^1];
            var cleaned = CleanAccountNumber(lastMatch.Value);
            if (cleaned.Length >= 2)
            {
                _logger.LogInformation("OCR parsed masked account (last of {Count}): {Account}", maskedMatches.Count, cleaned);
                return cleaned;
            }
        }

        // Pattern 3: Standalone 10-digit number with dashes (Thai bank format: xxx-x-xxxxx-x)
        var standalonMatch = Regex.Match(text, @"(\d{3}[\-]\d{1}[\-]\d{5}[\-]\d{1})");
        if (standalonMatch.Success)
        {
            var cleaned = CleanAccountNumber(standalonMatch.Value);
            _logger.LogInformation("OCR parsed standalone account: {Account}", cleaned);
            return cleaned;
        }

        _logger.LogWarning("OCR could not parse any account number from text");
        return null;
    }

    /// <summary>แปลงปี พ.ศ. หรือ 2 หลัก เป็น ค.ศ. 4 หลัก</summary>
    private static int ConvertToGregorianYear(int yearRaw)
    {
        if (yearRaw > 2500)
            return yearRaw - 543; // พ.ศ. → ค.ศ.
        if (yearRaw < 100)
        {
            // 2 หลัก: ถ้า > 50 ถือว่าเป็น พ.ศ. (เช่น 69 → 2569 → 2026)
            // ถ้า <= 50 ถือว่าเป็น ค.ศ. (เช่น 26 → 2026)
            return yearRaw > 50 ? yearRaw + 2500 - 543 : yearRaw + 2000;
        }
        return yearRaw; // ค.ศ. 4 หลักปกติ
    }

    /// <summary>ลบ x, -, ช่องว่าง ออกจากเลขบัญชี เหลือแค่ตัวเลข</summary>
    private static string CleanAccountNumber(string raw)
    {
        return Regex.Replace(raw, @"[^0-9]", "");
    }
}
