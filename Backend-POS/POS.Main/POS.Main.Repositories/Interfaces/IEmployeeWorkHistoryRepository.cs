using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IEmployeeWorkHistoryRepository : IGenericRepository<TbEmployeeWorkHistory>
{
    Task<IEnumerable<TbEmployeeWorkHistory>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default);
}
