using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class EmployeeRepository : GenericRepository<TbEmployee>, IEmployeeRepository
{
    public EmployeeRepository(POSMainContext context) : base(context)
    {
    }

    public override async Task<TbEmployee?> GetByIdAsync(int employeeId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position)
            .Include(e => e.CreatedByEmployee)
            .Include(e => e.UpdatedByEmployee)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId, ct);
    }

    public async Task<TbEmployee?> GetByIdWithDetailsAsync(int employeeId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position)
            .Include(e => e.Addresses)
            .Include(e => e.Educations)
            .Include(e => e.WorkHistories)
            .Include(e => e.CreatedByEmployee)
            .Include(e => e.UpdatedByEmployee)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId, ct);
    }

    public IQueryable<TbEmployee> GetEmployeesQuery(string? search, bool? isActive, int? positionId)
    {
        IQueryable<TbEmployee> query = QueryNoTracking()
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(e =>
                e.FirstNameThai.ToLower().Contains(term) ||
                e.LastNameThai.ToLower().Contains(term) ||
                e.FirstNameEnglish.ToLower().Contains(term) ||
                e.LastNameEnglish.ToLower().Contains(term));
        }

        if (isActive.HasValue)
            query = query.Where(e => e.IsActive == isActive.Value);

        if (positionId.HasValue)
            query = query.Where(e => e.PositionId == positionId.Value);

        return query.OrderBy(e => e.FirstNameThai).ThenBy(e => e.LastNameThai);
    }

    public async Task<bool> IsNationalIdExistsAsync(string nationalId, int? excludeId = null, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(nationalId))
            return false;

        var query = _context.Set<TbEmployee>().IgnoreQueryFilters()
            .Where(e => e.NationalId == nationalId);

        if (excludeId.HasValue)
            query = query.Where(e => e.EmployeeId != excludeId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<bool> IsEmailExistsAsync(string email, int? excludeId = null, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var query = _context.Set<TbEmployee>().IgnoreQueryFilters()
            .Where(e => e.Email == email);

        if (excludeId.HasValue)
            query = query.Where(e => e.EmployeeId != excludeId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<TbEmployee?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(e => e.User)
            .Include(e => e.Position)
            .FirstOrDefaultAsync(e => e.UserId == userId, ct);
    }
}
