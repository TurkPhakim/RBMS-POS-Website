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

    public async Task RevokeAllByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var activeTokens = await _dbSet
            .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
        }
    }
}
