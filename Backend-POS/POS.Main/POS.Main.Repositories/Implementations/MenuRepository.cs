using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class MenuRepository : GenericRepository<TbMenu>, IMenuRepository
{
    public MenuRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbMenu?> GetMenuWithOptionsAsync(int menuId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(m => m.SubCategory)
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .Include(m => m.MenuOptionGroups.OrderBy(mog => mog.SortOrder))
                .ThenInclude(mog => mog.OptionGroup)
                    .ThenInclude(og => og.OptionItems.OrderBy(oi => oi.SortOrder))
            .FirstOrDefaultAsync(m => m.MenuId == menuId, ct);
    }
}
