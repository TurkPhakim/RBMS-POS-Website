using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class EmployeeWorkHistoryRepository : GenericRepository<TbEmployeeWorkHistory>, IEmployeeWorkHistoryRepository
{
    public EmployeeWorkHistoryRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbEmployeeWorkHistory>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Where(w => w.EmployeeId == employeeId)
            .OrderByDescending(w => w.StartDate)
            .ToListAsync(ct);
    }
}
