using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class AuthorizeMatrixPositionRepository : GenericRepository<TbAuthorizeMatrixPosition>, IAuthorizeMatrixPositionRepository
{
    public AuthorizeMatrixPositionRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbAuthorizeMatrixPosition>> GetByPositionIdAsync(int positionId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(amp => amp.AuthorizeMatrix)
            .Where(amp => amp.PositionId == positionId)
            .ToListAsync(ct);
    }

    public async Task<HashSet<string>> GetPermissionPathsByPositionIdAsync(int positionId, CancellationToken ct = default)
    {
        var paths = await QueryNoTracking()
            .Where(amp => amp.PositionId == positionId)
            .Select(amp => amp.AuthorizeMatrix.PermissionPath)
            .ToListAsync(ct);

        return paths.ToHashSet();
    }

    public async Task ReplacePermissionsForPositionAsync(int positionId, List<int> authorizeMatrixIds, CancellationToken ct = default)
    {
        var existing = await _dbSet
            .Where(amp => amp.PositionId == positionId)
            .ToListAsync(ct);

        _dbSet.RemoveRange(existing);

        var newEntries = authorizeMatrixIds.Select(matrixId => new TbAuthorizeMatrixPosition
        {
            AuthorizeMatrixId = matrixId,
            PositionId = positionId
        });

        await _dbSet.AddRangeAsync(newEntries, ct);
    }
}
