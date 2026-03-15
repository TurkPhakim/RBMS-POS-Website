using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class PasswordHistoryRepository : GenericRepository<TbPasswordHistory>, IPasswordHistoryRepository
{
    public PasswordHistoryRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbPasswordHistory>> GetRecentByUserIdAsync(Guid userId, int count, CancellationToken ct = default)
    {
        return await _dbSet
            .Where(ph => ph.UserId == userId)
            .OrderByDescending(ph => ph.CreatedAt)
            .Take(count)
            .ToListAsync(ct);
    }
}
