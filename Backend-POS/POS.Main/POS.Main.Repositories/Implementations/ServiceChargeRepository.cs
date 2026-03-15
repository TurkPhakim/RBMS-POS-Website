using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class ServiceChargeRepository : GenericRepository<TbServiceCharge>, IServiceChargeRepository
{
    public ServiceChargeRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbServiceCharge>> GetAllActiveAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(sc => sc.CreatedByEmployee)
            .Include(sc => sc.UpdatedByEmployee)
            .OrderBy(sc => sc.Name)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TbServiceCharge>> GetActiveInDateRangeForDropdownAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        return await QueryNoTracking()
            .Where(sc => sc.IsActive)
            .Where(sc => sc.StartDate == null || sc.StartDate <= now)
            .Where(sc => sc.EndDate == null || sc.EndDate >= now)
            .OrderBy(sc => sc.Name)
            .ToListAsync(ct);
    }

    public async Task<bool> IsNameExistsAsync(string name, int? excludeId = null, CancellationToken ct = default)
    {
        var query = _dbSet.Where(sc => sc.Name.ToLower() == name.ToLower());

        if (excludeId.HasValue)
        {
            query = query.Where(sc => sc.ServiceChargeId != excludeId.Value);
        }

        return await query.AnyAsync(ct);
    }
}
