using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IMenuRepository : IGenericRepository<TbMenu>
{
    Task<IEnumerable<TbMenu>> GetAllActiveAsync(CancellationToken ct = default);

    Task<IEnumerable<TbMenu>> GetByCategoryAsync(EMenuCategory category, CancellationToken ct = default);

    Task<IEnumerable<TbMenu>> GetAvailableMenusAsync(CancellationToken ct = default);

    Task<bool> IsNameExistsAsync(string nameThai, string nameEnglish, int? excludeId = null, CancellationToken ct = default);

    Task<IEnumerable<TbMenu>> SearchByNameAsync(string searchTerm, CancellationToken ct = default);
}
