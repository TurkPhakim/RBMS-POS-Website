using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IShopSettingsRepository : IGenericRepository<TbShopSettings>
{
    Task<TbShopSettings?> GetWithOperatingHoursAsync(CancellationToken ct = default);
}
