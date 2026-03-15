using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class PasswordResetTokenRepository : GenericRepository<TbPasswordResetToken>, IPasswordResetTokenRepository
{
    public PasswordResetTokenRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbPasswordResetToken?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsUsed && t.OtpExpiresAt > DateTime.UtcNow, ct);
    }

    public async Task<TbPasswordResetToken?> GetByResetTokenAsync(string resetToken, CancellationToken ct = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(t => t.ResetToken == resetToken && !t.IsUsed && t.ResetTokenExpiresAt > DateTime.UtcNow, ct);
    }

    public async Task InvalidateAllByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var activeTokens = await _dbSet
            .Where(t => t.UserId == userId && !t.IsUsed)
            .ToListAsync(ct);

        foreach (var token in activeTokens)
        {
            token.IsUsed = true;
        }
    }
}
