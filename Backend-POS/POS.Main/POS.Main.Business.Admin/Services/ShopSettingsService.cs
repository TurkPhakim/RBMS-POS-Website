using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Admin.Models.ShopSettings;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
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

    public async Task<CurrentPeriodResultModel> GetCurrentPeriodAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.ShopSettings.GetWithOperatingHoursAsync(ct);

        // ไม่มี settings → default เปิด ไม่ filter
        if (settings == null)
            return new CurrentPeriodResultModel { IsOpen = true, HasTwoPeriods = false };

        // ใช้ BangkokNow เพื่อให้ timezone ถูกต้องเสมอ (UTC+7)
        var bangkokNow = DateTimeHelper.BangkokNow();
        var todayDow = MapDayOfWeek(bangkokNow.DayOfWeek);
        var todayHours = settings.OperatingHours.FirstOrDefault(h => h.DayOfWeek == todayDow);

        // ไม่มีข้อมูลวันนี้ → default เปิด
        if (todayHours == null)
            return new CurrentPeriodResultModel { IsOpen = true, HasTwoPeriods = settings.HasTwoPeriods };

        // วันนี้ปิด
        if (!todayHours.IsOpen)
            return new CurrentPeriodResultModel { IsOpen = false, HasTwoPeriods = settings.HasTwoPeriods };

        var now = bangkokNow.TimeOfDay;

        // 1 ช่วง → เช็คเวลาใน period 1
        if (!settings.HasTwoPeriods)
        {
            var isOpen = IsWithinTimeRange(now, todayHours.OpenTime1, todayHours.CloseTime1);
            return new CurrentPeriodResultModel { IsOpen = isOpen, CurrentPeriod = isOpen ? "period1" : null, HasTwoPeriods = false };
        }

        // 2 ช่วง → เช็คเวลาปัจจุบัน
        if (IsWithinTimeRange(now, todayHours.OpenTime1, todayHours.CloseTime1))
            return new CurrentPeriodResultModel { IsOpen = true, CurrentPeriod = "period1", HasTwoPeriods = true };

        if (IsWithinTimeRange(now, todayHours.OpenTime2, todayHours.CloseTime2))
            return new CurrentPeriodResultModel { IsOpen = true, CurrentPeriod = "period2", HasTwoPeriods = true };

        // อยู่ระหว่าง period → ร้านปิดชั่วคราว
        return new CurrentPeriodResultModel { IsOpen = false, CurrentPeriod = null, HasTwoPeriods = true };
    }

    private static EDayOfWeek MapDayOfWeek(DayOfWeek systemDay)
    {
        return systemDay switch
        {
            DayOfWeek.Monday => EDayOfWeek.Monday,
            DayOfWeek.Tuesday => EDayOfWeek.Tuesday,
            DayOfWeek.Wednesday => EDayOfWeek.Wednesday,
            DayOfWeek.Thursday => EDayOfWeek.Thursday,
            DayOfWeek.Friday => EDayOfWeek.Friday,
            DayOfWeek.Saturday => EDayOfWeek.Saturday,
            DayOfWeek.Sunday => EDayOfWeek.Sunday,
            _ => EDayOfWeek.Monday
        };
    }

    private static bool IsWithinTimeRange(TimeSpan now, TimeSpan? open, TimeSpan? close)
    {
        if (open == null || close == null)
            return false;

        // รองรับข้ามวัน (เช่น 22:00-02:00)
        if (close.Value < open.Value)
            return now >= open.Value || now < close.Value;

        return now >= open.Value && now < close.Value;
    }
}
