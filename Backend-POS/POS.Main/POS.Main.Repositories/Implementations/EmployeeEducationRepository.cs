using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class EmployeeEducationRepository : GenericRepository<TbEmployeeEducation>, IEmployeeEducationRepository
{
    public EmployeeEducationRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbEmployeeEducation>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .OrderByDescending(e => e.GraduationYear)
            .ToListAsync(ct);
    }
}
