using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.ShopSettings;
using POS.Main.Core.Exceptions;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Admin.Services;

public class ShopSettingsService : IShopSettingsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ShopSettingsService> _logger;

    public ShopSettingsService(IUnitOfWork unitOfWork, ILogger<ShopSettingsService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ShopBrandingResponseModel> GetBrandingAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ShopSettings
            .QueryNoTracking()
            .FirstOrDefaultAsync(ct);

        if (settings == null)
            return new ShopBrandingResponseModel();

        return ShopSettingsMapper.ToBrandingResponse(settings);
    }

    public async Task<WelcomeShopInfoResponseModel?> GetWelcomeShopInfoAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ShopSettings.GetWithOperatingHoursAsync(ct);

        if (settings == null)
            return null;

        return ShopSettingsMapper.ToWelcomeResponse(settings);
    }

    public async Task<ShopSettingsResponseModel> GetShopSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ShopSettings.GetWithOperatingHoursAsync(ct);

        if (settings == null)
            throw new EntityNotFoundException("ShopSettings", 1);

        return ShopSettingsMapper.ToResponse(settings);
    }

    public async Task<ShopSettingsResponseModel> UpdateShopSettingsAsync(
        UpdateShopSettingsRequestModel request,
        int? logoFileId,
        int? paymentQrCodeFileId,
        CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ShopSettings.GetWithOperatingHoursAsync(ct);

        if (settings == null)
            throw new EntityNotFoundException("ShopSettings", 1);

        // อัปเดต fields ทั่วไป
        ShopSettingsMapper.UpdateEntity(settings, request);

        // อัปเดตโลโก้
        if (request.RemoveLogo)
            settings.LogoFileId = null;
        else if (logoFileId.HasValue)
            settings.LogoFileId = logoFileId.Value;

        // อัปเดต QR Code
        if (request.RemoveQrCode)
            settings.PaymentQrCodeFileId = null;
        else if (paymentQrCodeFileId.HasValue)
            settings.PaymentQrCodeFileId = paymentQrCodeFileId.Value;

        // อัปเดต Operating Hours — match by DayOfWeek
        foreach (var hourModel in request.OperatingHours)
        {
            var existingHour = settings.OperatingHours
                .FirstOrDefault(h => h.DayOfWeek == hourModel.DayOfWeek);

            if (existingHour != null)
            {
                ShopSettingsMapper.UpdateOperatingHour(existingHour, hourModel);
            }
        }

        _unitOfWork.ShopSettings.Update(settings);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("ShopSettings updated: {ShopSettingsId}", settings.ShopSettingsId);

        // Re-query เพื่อ return response ที่สมบูรณ์ (รวม navigation properties)
        var updated = await _unitOfWork.ShopSettings.GetWithOperatingHoursAsync(ct);
        return ShopSettingsMapper.ToResponse(updated!);
    }
}
