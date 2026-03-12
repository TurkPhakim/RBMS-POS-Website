using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IModuleRepository : IGenericRepository<TbmModule>
{
    Task<IEnumerable<TbmModule>> GetModuleTreeAsync(CancellationToken ct = default);
}
