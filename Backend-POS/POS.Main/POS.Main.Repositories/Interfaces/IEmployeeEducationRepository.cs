using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IEmployeeEducationRepository : IGenericRepository<TbEmployeeEducation>
{
    Task<IEnumerable<TbEmployeeEducation>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default);
}
