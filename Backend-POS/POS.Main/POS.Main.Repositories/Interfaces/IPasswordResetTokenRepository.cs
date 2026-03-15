using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IPasswordResetTokenRepository : IGenericRepository<TbPasswordResetToken>
{
    Task<TbPasswordResetToken?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);

    Task<TbPasswordResetToken?> GetByResetTokenAsync(string resetToken, CancellationToken ct = default);

    Task InvalidateAllByUserIdAsync(Guid userId, CancellationToken ct = default);
}
