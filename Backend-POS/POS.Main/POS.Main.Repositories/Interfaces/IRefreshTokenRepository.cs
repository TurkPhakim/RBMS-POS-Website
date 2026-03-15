using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IRefreshTokenRepository : IGenericRepository<TbRefreshToken>
{
    Task<TbRefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);

    Task RevokeAllByUserIdAsync(Guid userId, CancellationToken ct = default);
}
