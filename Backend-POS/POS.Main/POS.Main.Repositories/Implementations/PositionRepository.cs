using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class PositionRepository : GenericRepository<TbmPosition>, IPositionRepository
{
    public PositionRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbmPosition>> GetAllActiveAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .OrderBy(p => p.PositionName)
            .ToListAsync(ct);
    }

    public async Task<bool> IsNameExistsAsync(string name, int? excludeId = null, CancellationToken ct = default)
    {
        var query = _dbSet.Where(p => p.PositionName.ToLower() == name.ToLower());

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.PositionId != excludeId.Value);
        }

        return await query.AnyAsync(ct);
    }
}
