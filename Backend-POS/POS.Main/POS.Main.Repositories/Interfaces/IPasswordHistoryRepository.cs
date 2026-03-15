using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IPasswordHistoryRepository : IGenericRepository<TbPasswordHistory>
{
    Task<IEnumerable<TbPasswordHistory>> GetRecentByUserIdAsync(Guid userId, int count, CancellationToken ct = default);
}
