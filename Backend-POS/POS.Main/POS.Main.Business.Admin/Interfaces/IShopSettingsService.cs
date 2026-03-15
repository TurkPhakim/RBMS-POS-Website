using POS.Main.Business.Admin.Models.ShopSettings;

namespace POS.Main.Business.Admin.Interfaces;

public interface IShopSettingsService
{
    Task<ShopBrandingResponseModel> GetBrandingAsync(CancellationToken ct = default);
    Task<WelcomeShopInfoResponseModel?> GetWelcomeShopInfoAsync(CancellationToken ct = default);
    Task<ShopSettingsResponseModel> GetShopSettingsAsync(CancellationToken ct = default);
    Task<ShopSettingsResponseModel> UpdateShopSettingsAsync(
        UpdateShopSettingsRequestModel request,
        int? logoFileId,
        int? paymentQrCodeFileId,
        CancellationToken ct = default);
}
