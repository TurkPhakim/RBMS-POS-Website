using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IOptionGroupRepository : IGenericRepository<TbOptionGroup>
{
    Task<TbOptionGroup?> GetWithItemsAsync(int optionGroupId, CancellationToken ct = default);
    Task<int> CountLinkedMenusAsync(int optionGroupId, CancellationToken ct = default);
}
