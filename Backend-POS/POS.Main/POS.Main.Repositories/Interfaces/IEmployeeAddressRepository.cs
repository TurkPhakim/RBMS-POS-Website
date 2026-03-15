using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IEmployeeAddressRepository : IGenericRepository<TbEmployeeAddress>
{
    Task<IEnumerable<TbEmployeeAddress>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default);
}
