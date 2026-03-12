using Microsoft.EntityFrameworkCore;
using POS.Main.Core.Enums;
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

    public async Task<IEnumerable<TbEmployee>> GetAllActiveAsync(CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position)
            .Include(e => e.CreatedByEmployee)
            .Include(e => e.UpdatedByEmployee)
            .OrderBy(e => e.FirstNameThai)
            .ThenBy(e => e.LastNameThai)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TbEmployee>> GetByEmploymentStatusAsync(EEmploymentStatus status, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position)
            .Include(e => e.CreatedByEmployee)
            .Include(e => e.UpdatedByEmployee)
            .Where(e => e.EmploymentStatus == status)
            .OrderBy(e => e.FirstNameThai)
            .ThenBy(e => e.LastNameThai)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<TbEmployee>> SearchAsync(string searchTerm, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetAllActiveAsync(ct);
        }

        var term = searchTerm.Trim().ToLower();

        return await QueryNoTracking()
            .Include(e => e.ImageFile)
            .Include(e => e.User)
            .Include(e => e.Position)
            .Include(e => e.CreatedByEmployee)
            .Include(e => e.UpdatedByEmployee)
            .Where(e =>
                e.FirstNameThai.ToLower().Contains(term) ||
                e.LastNameThai.ToLower().Contains(term) ||
                e.FirstNameEnglish.ToLower().Contains(term) ||
                e.LastNameEnglish.ToLower().Contains(term) ||
                (e.Nickname != null && e.Nickname.ToLower().Contains(term)) ||
                (e.NationalId != null && e.NationalId.Contains(term)) ||
                (e.Phone != null && e.Phone.Contains(term)))
            .OrderBy(e => e.FirstNameThai)
            .ThenBy(e => e.LastNameThai)
            .ToListAsync(ct);
    }

    public async Task<bool> IsNationalIdExistsAsync(string nationalId, int? excludeId = null, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(nationalId))
        {
            return false;
        }

        var query = _dbSet.Where(e => e.NationalId == nationalId);

        if (excludeId.HasValue)
        {
            query = query.Where(e => e.EmployeeId != excludeId.Value);
        }

        return await query.AnyAsync(ct);
    }

    public async Task<bool> IsEmailExistsAsync(string email, int? excludeId = null, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var query = _dbSet.Where(e => e.Email == email);

        if (excludeId.HasValue)
        {
            query = query.Where(e => e.EmployeeId != excludeId.Value);
        }

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
