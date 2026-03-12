using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class AuthorizeMatrixRepository : GenericRepository<TbmAuthorizeMatrix>, IAuthorizeMatrixRepository
{
    public AuthorizeMatrixRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbmAuthorizeMatrix>> GetAllWithDetailsAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(am => am.Module)
            .Include(am => am.Permission)
            .OrderBy(am => am.Module.SortOrder)
            .ThenBy(am => am.Permission.SortOrder)
            .ToListAsync(ct);
    }
}
