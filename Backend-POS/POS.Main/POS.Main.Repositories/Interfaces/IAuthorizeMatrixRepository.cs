using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IAuthorizeMatrixRepository : IGenericRepository<TbmAuthorizeMatrix>
{
    Task<IEnumerable<TbmAuthorizeMatrix>> GetAllWithDetailsAsync(CancellationToken ct = default);
}
