using POS.Main.Dal.Entities;

namespace POS.Main.Business.Admin.Models.ShopSettings;

public static class ShopSettingsMapper
{
    public static ShopSettingsResponseModel ToResponse(TbShopSettings entity)
        => new()
        {
            ShopSettingsId = entity.ShopSettingsId,
            ShopNameThai = entity.ShopNameThai,
            ShopNameEnglish = entity.ShopNameEnglish,
            CompanyNameThai = entity.CompanyNameThai,
            CompanyNameEnglish = entity.CompanyNameEnglish,
            TaxId = entity.TaxId,
            FoodType = entity.FoodType,
            Description = entity.Description,
            LogoFileId = entity.LogoFileId,
            LogoFileName = entity.LogoFile?.FileName,
            HasTwoPeriods = entity.HasTwoPeriods,
            Address = entity.Address,
            PhoneNumber = entity.PhoneNumber,
            ShopEmail = entity.ShopEmail,
            Facebook = entity.Facebook,
            Instagram = entity.Instagram,
            Website = entity.Website,
            LineId = entity.LineId,
            PaymentQrCodeFileId = entity.PaymentQrCodeFileId,
            PaymentQrCodeFileName = entity.PaymentQrCodeFile?.FileName,
            OperatingHours = entity.OperatingHours
                .OrderBy(h => h.DayOfWeek)
                .Select(ToOperatingHourModel)
                .ToList(),
            CreatedByName = entity.CreatedByEmployee != null
                ? $"{entity.CreatedByEmployee.FirstNameThai} {entity.CreatedByEmployee.LastNameThai}"
                : null,
            CreatedAt = entity.CreatedAt,
            UpdatedByName = entity.UpdatedByEmployee != null
                ? $"{entity.UpdatedByEmployee.FirstNameThai} {entity.UpdatedByEmployee.LastNameThai}"
                : null,
            UpdatedAt = entity.UpdatedAt
        };

    public static OperatingHourModel ToOperatingHourModel(TbShopOperatingHour entity)
        => new()
        {
            ShopOperatingHourId = entity.ShopOperatingHourId,
            DayOfWeek = entity.DayOfWeek,
            IsOpen = entity.IsOpen,
            OpenTime1 = entity.OpenTime1?.ToString(@"hh\:mm"),
            CloseTime1 = entity.CloseTime1?.ToString(@"hh\:mm"),
            OpenTime2 = entity.OpenTime2?.ToString(@"hh\:mm"),
            CloseTime2 = entity.CloseTime2?.ToString(@"hh\:mm")
        };

    public static ShopBrandingResponseModel ToBrandingResponse(TbShopSettings entity)
        => new()
        {
            ShopNameEnglish = entity.ShopNameEnglish,
            LogoFileId = entity.LogoFileId
        };

    public static WelcomeShopInfoResponseModel ToWelcomeResponse(TbShopSettings entity)
        => new()
        {
            ShopNameThai = entity.ShopNameThai,
            ShopNameEnglish = entity.ShopNameEnglish,
            FoodType = entity.FoodType,
            Description = entity.Description,
            PhoneNumber = entity.PhoneNumber,
            LogoFileId = entity.LogoFileId,
            HasTwoPeriods = entity.HasTwoPeriods,
            OperatingHours = entity.OperatingHours
                .OrderBy(h => h.DayOfWeek)
                .Select(ToOperatingHourModel)
                .ToList()
        };

    public static void UpdateEntity(TbShopSettings entity, UpdateShopSettingsRequestModel request)
    {
        entity.ShopNameThai = request.ShopNameThai;
        entity.ShopNameEnglish = request.ShopNameEnglish;
        entity.CompanyNameThai = request.CompanyNameThai;
        entity.CompanyNameEnglish = request.CompanyNameEnglish;
        entity.TaxId = request.TaxId;
        entity.FoodType = request.FoodType;
        entity.Description = request.Description;
        entity.HasTwoPeriods = request.HasTwoPeriods;
        entity.Address = request.Address;
        entity.PhoneNumber = request.PhoneNumber;
        entity.ShopEmail = request.ShopEmail;
        entity.Facebook = request.Facebook;
        entity.Instagram = request.Instagram;
        entity.Website = request.Website;
        entity.LineId = request.LineId;
    }

    public static void UpdateOperatingHour(TbShopOperatingHour entity, OperatingHourModel model)
    {
        entity.IsOpen = model.IsOpen;
        entity.OpenTime1 = ParseTime(model.OpenTime1);
        entity.CloseTime1 = ParseTime(model.CloseTime1);
        entity.OpenTime2 = ParseTime(model.OpenTime2);
        entity.CloseTime2 = ParseTime(model.CloseTime2);
    }

    private static TimeSpan? ParseTime(string? time)
        => string.IsNullOrWhiteSpace(time) ? null : TimeSpan.Parse(time);
}
