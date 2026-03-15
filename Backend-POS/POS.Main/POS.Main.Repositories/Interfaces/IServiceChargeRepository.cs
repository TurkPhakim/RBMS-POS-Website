using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IServiceChargeRepository : IGenericRepository<TbServiceCharge>
{
    Task<IEnumerable<TbServiceCharge>> GetAllActiveAsync(CancellationToken ct = default);

    Task<IEnumerable<TbServiceCharge>> GetActiveInDateRangeForDropdownAsync(CancellationToken ct = default);

    Task<bool> IsNameExistsAsync(string name, int? excludeId = null, CancellationToken ct = default);
}
