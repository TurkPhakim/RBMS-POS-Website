using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IEmployeeRepository : IGenericRepository<TbEmployee>
{
    Task<IEnumerable<TbEmployee>> GetAllActiveAsync(CancellationToken ct = default);

    Task<IEnumerable<TbEmployee>> GetByEmploymentStatusAsync(EEmploymentStatus status, CancellationToken ct = default);

    Task<IEnumerable<TbEmployee>> SearchAsync(string searchTerm, CancellationToken ct = default);

    Task<bool> IsNationalIdExistsAsync(string nationalId, int? excludeId = null, CancellationToken ct = default);

    Task<bool> IsEmailExistsAsync(string email, int? excludeId = null, CancellationToken ct = default);

    Task<TbEmployee?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
}
