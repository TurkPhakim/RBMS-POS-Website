using POS.Main.Core.Models;
using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IEmployeeRepository : IGenericRepository<TbEmployee>
{
    IQueryable<TbEmployee> GetEmployeesQuery(string? search, bool? isActive, int? positionId);

    Task<bool> IsNationalIdExistsAsync(string nationalId, int? excludeId = null, CancellationToken ct = default);

    Task<bool> IsEmailExistsAsync(string email, int? excludeId = null, CancellationToken ct = default);

    Task<TbEmployee?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    Task<TbEmployee?> GetByIdWithDetailsAsync(int employeeId, CancellationToken ct = default);
}
