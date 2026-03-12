using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class ModuleRepository : GenericRepository<TbmModule>, IModuleRepository
{
    public ModuleRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbmModule>> GetModuleTreeAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Where(m => m.ParentModuleId == null)
            .Include(m => m.ChildModules.OrderBy(c => c.SortOrder))
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);
    }
}
