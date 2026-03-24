using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class OptionGroupRepository : GenericRepository<TbOptionGroup>, IOptionGroupRepository
{
    public OptionGroupRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbOptionGroup?> GetWithItemsAsync(int optionGroupId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(og => og.OptionItems.OrderBy(oi => oi.SortOrder))
            .Include(og => og.CreatedByEmployee)
            .Include(og => og.UpdatedByEmployee)
            .FirstOrDefaultAsync(og => og.OptionGroupId == optionGroupId, ct);
    }

    public async Task<int> CountLinkedMenusAsync(int optionGroupId, CancellationToken ct = default)
    {
        return await _context.MenuOptionGroups
            .Where(mog => mog.OptionGroupId == optionGroupId)
            .CountAsync(ct);
    }
}
