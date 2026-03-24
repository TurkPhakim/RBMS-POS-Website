using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IMenuRepository : IGenericRepository<TbMenu>
{
    Task<TbMenu?> GetMenuWithOptionsAsync(int menuId, CancellationToken ct = default);
}
