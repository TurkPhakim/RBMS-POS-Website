using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POS.Main.Core.Helpers;
using POS.Main.Repositories.UnitOfWork;

namespace RBMS.POS.WebAPI.Controllers;

[ApiController]
public class QrRedirectController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ILogger<QrRedirectController> _logger;

    public QrRedirectController(
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ILogger<QrRedirectController> logger)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("q/{code}")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> RedirectByShortCode(string code, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .FirstOrDefaultAsync(t => t.QrShortCode == code, ct);

        if (table == null || string.IsNullOrEmpty(table.QrToken))
        {
            _logger.LogWarning("QR Short Code not found or expired: {Code}", code);
            return NotFound("QR Code ไม่ถูกต้องหรือหมดอายุ");
        }

        if (table.QrTokenExpiresAt.HasValue && table.QrTokenExpiresAt.Value < DateTimeHelper.BangkokNow())
        {
            _logger.LogWarning("QR Token expired for code: {Code}", code);
            return NotFound("QR Code หมดอายุแล้ว");
        }

        var selfOrderUrl = _configuration["SelfOrderUrl"] ?? "http://localhost:4400";
        var redirectUrl = $"{selfOrderUrl}/auth?token={table.QrToken}";

        return Redirect(redirectUrl);
    }
}
