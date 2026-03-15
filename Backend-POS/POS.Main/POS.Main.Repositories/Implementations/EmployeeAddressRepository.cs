using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class EmployeeAddressRepository : GenericRepository<TbEmployeeAddress>, IEmployeeAddressRepository
{
    public EmployeeAddressRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<IEnumerable<TbEmployeeAddress>> GetByEmployeeIdAsync(int employeeId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Where(a => a.EmployeeId == employeeId)
            .OrderBy(a => a.AddressType)
            .ToListAsync(ct);
    }
}
