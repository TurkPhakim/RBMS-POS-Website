using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class RefreshTokenRepository : GenericRepository<TbRefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbRefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token, ct);
    }
}
