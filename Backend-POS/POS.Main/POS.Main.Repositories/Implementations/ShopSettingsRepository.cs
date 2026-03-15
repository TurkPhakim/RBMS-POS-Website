using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class ShopSettingsRepository : GenericRepository<TbShopSettings>, IShopSettingsRepository
{
    public ShopSettingsRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbShopSettings?> GetWithOperatingHoursAsync(CancellationToken ct = default)
    {
        return await _dbSet
            .Include(s => s.OperatingHours.OrderBy(h => h.DayOfWeek))
            .Include(s => s.LogoFile)
            .Include(s => s.PaymentQrCodeFile)
            .Include(s => s.CreatedByEmployee)
            .Include(s => s.UpdatedByEmployee)
            .FirstOrDefaultAsync(ct);
    }
}
