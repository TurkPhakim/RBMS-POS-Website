using Microsoft.EntityFrameworkCore;
using POS.Main.Core.Enums;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class MenuRepository : GenericRepository<TbMenu>, IMenuRepository
{
    public MenuRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbMenu>> GetAllActiveAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.NameEnglish)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TbMenu>> GetByCategoryAsync(EMenuCategory category, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .Where(m => m.Category == category)
            .OrderBy(m => m.NameEnglish)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TbMenu>> GetAvailableMenusAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .Where(m => m.IsActive && m.IsAvailable)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.NameEnglish)
            .ToListAsync(ct);
    }

    public async Task<bool> IsNameExistsAsync(string nameThai, string nameEnglish, int? excludeId = null, CancellationToken ct = default)
    {
        var query = _dbSet.Where(m =>
            m.NameThai.ToLower() == nameThai.ToLower() ||
            m.NameEnglish.ToLower() == nameEnglish.ToLower());

        if (excludeId.HasValue)
        {
            query = query.Where(m => m.MenuId != excludeId.Value);
        }

        return await query.AnyAsync(ct);
    }

    public async Task<IEnumerable<TbMenu>> SearchByNameAsync(string searchTerm, CancellationToken ct = default)
    {
        var lowerSearchTerm = searchTerm.ToLower();

        return await QueryNoTracking()
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .Where(m =>
                m.NameThai.ToLower().Contains(lowerSearchTerm) ||
                m.NameEnglish.ToLower().Contains(lowerSearchTerm))
            .OrderBy(m => m.Category)
            .ThenBy(m => m.NameEnglish)
            .ToListAsync(ct);
    }
}
