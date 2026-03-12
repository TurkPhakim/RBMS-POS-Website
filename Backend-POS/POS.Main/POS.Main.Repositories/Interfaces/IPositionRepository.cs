using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IPositionRepository : IGenericRepository<TbmPosition>
{
    Task<IEnumerable<TbmPosition>> GetAllActiveAsync(CancellationToken ct = default);
    Task<bool> IsNameExistsAsync(string name, int? excludeId = null, CancellationToken ct = default);
}
