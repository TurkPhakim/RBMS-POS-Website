using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class MenuSubCategoryRepository : GenericRepository<TbMenuSubCategory>, IMenuSubCategoryRepository
{
    public MenuSubCategoryRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<int> CountMenusAsync(int subCategoryId, CancellationToken ct = default)
    {
        return await _context.Menus
            .Where(m => m.SubCategoryId == subCategoryId)
            .CountAsync(ct);
    }
}
