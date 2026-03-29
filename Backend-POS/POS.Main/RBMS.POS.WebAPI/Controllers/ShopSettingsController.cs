using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.ShopSettings;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// Shop settings management endpoints
/// </summary>
[Authorize]
[Route("api/admin/shop-settings")]
public class ShopSettingsController : BaseController
{
    private readonly IShopSettingsService _shopSettingsService;
    private readonly IFileService _fileService;

    public ShopSettingsController(IShopSettingsService shopSettingsService, IFileService fileService)
    {
        _shopSettingsService = shopSettingsService;
        _fileService = fileService;
    }

    /// <summary>
    /// ดึงข้อมูล branding (ชื่อร้าน + โลโก้) สำหรับ Header — ทุกคนที่ login ดูได้
    /// </summary>
    [HttpGet("branding")]
    [ProducesResponseType(typeof(BaseResponseModel<ShopBrandingResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBranding(CancellationToken ct = default)
        => Success(await _shopSettingsService.GetBrandingAsync(ct));

    /// <summary>
    /// ดึงข้อมูลร้านค้าสำหรับหน้า Welcome — ทุกคนที่ login ดูได้ (ไม่ต้อง permission)
    /// </summary>
    [HttpGet("welcome")]
    [ProducesResponseType(typeof(BaseResponseModel<WelcomeShopInfoResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWelcomeShopInfo(CancellationToken ct = default)
        => Success(await _shopSettingsService.GetWelcomeShopInfoAsync(ct));

    /// <summary>
    /// ดึงสถานะช่วงเวลาเปิด-ปิดปัจจุบัน — ทุกคนที่ login ดูได้
    /// </summary>
    [HttpGet("current-period")]
    [ProducesResponseType(typeof(BaseResponseModel<CurrentPeriodResultModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentPeriod(CancellationToken ct = default)
        => Success(await _shopSettingsService.GetCurrentPeriodAsync(ct));

    /// <summary>
    /// ดึงข้อมูลตั้งค่าร้านค้า
    /// </summary>
    [HttpGet]
    [PermissionAuthorize(Permissions.ShopSettings.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ShopSettingsResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct = default)
        => Success(await _shopSettingsService.GetShopSettingsAsync(ct));

    /// <summary>
    /// อัปเดตข้อมูลตั้งค่าร้านค้า
    /// </summary>
    [HttpPut]
    [PermissionAuthorize(Permissions.ShopSettings.Update)]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<ShopSettingsResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(
        [FromForm] UpdateShopSettingsRequestModel request,
        IFormFile? logoFile,
        IFormFile? paymentQrCodeFile,
        CancellationToken ct = default)
    {
        // Validate image types
        string[] allowedImageTypes = ["image/png", "image/jpeg"];
        if (logoFile != null && !allowedImageTypes.Contains(logoFile.ContentType))
            throw new ValidationException("โลโก้ร้านค้ารองรับเฉพาะไฟล์ .png และ .jpg เท่านั้น");

        if (paymentQrCodeFile != null && !allowedImageTypes.Contains(paymentQrCodeFile.ContentType))
            throw new ValidationException("QR Code รองรับเฉพาะไฟล์ .png และ .jpg เท่านั้น");

        int? logoFileId = null;
        if (logoFile != null)
        {
            var fileResult = await _fileService.UploadAsync(logoFile, ct);
            logoFileId = fileResult.FileId;
        }

        int? qrCodeFileId = null;
        if (paymentQrCodeFile != null)
        {
            var fileResult = await _fileService.UploadAsync(paymentQrCodeFile, ct);
            qrCodeFileId = fileResult.FileId;
        }

        var result = await _shopSettingsService.UpdateShopSettingsAsync(request, logoFileId, qrCodeFileId, ct);
        return Success(result);
    }
}
