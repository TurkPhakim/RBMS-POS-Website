using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IAuthorizeMatrixPositionRepository : IGenericRepository<TbAuthorizeMatrixPosition>
{
    Task<IEnumerable<TbAuthorizeMatrixPosition>> GetByPositionIdAsync(int positionId, CancellationToken ct = default);
    Task<HashSet<string>> GetPermissionPathsByPositionIdAsync(int positionId, CancellationToken ct = default);
    Task ReplacePermissionsForPositionAsync(int positionId, List<int> authorizeMatrixIds, CancellationToken ct = default);
}
