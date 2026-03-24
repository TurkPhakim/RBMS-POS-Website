using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IMenuSubCategoryRepository : IGenericRepository<TbMenuSubCategory>
{
    Task<int> CountMenusAsync(int subCategoryId, CancellationToken ct = default);
}
