using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class UserRepository : GenericRepository<TbUser>, IUserRepository
{
    public UserRepository(POSMainContext context) : base(context)
    {
    }

    public async Task<TbUser?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username == username, ct);
    }

    public async Task<TbUser?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail, ct);
    }

    public IQueryable<TbUser> GetUsersQuery(string? search, bool? isActive, bool? isLocked, int? positionId)
    {
        IQueryable<TbUser> query = QueryNoTracking()
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Position);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(term) ||
                (u.Employee != null && (
                    u.Employee.FirstNameThai.ToLower().Contains(term) ||
                    u.Employee.LastNameThai.ToLower().Contains(term) ||
                    u.Employee.FirstNameEnglish.ToLower().Contains(term) ||
                    u.Employee.LastNameEnglish.ToLower().Contains(term)
                )));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (isLocked.HasValue)
            query = query.Where(u => u.IsLockedByAdmin == isLocked.Value);

        if (positionId.HasValue)
            query = query.Where(u => u.Employee != null && u.Employee.PositionId == positionId.Value);

        return query.OrderBy(u => u.Employee != null ? u.Employee.FirstNameThai : u.Username);
    }

    public async Task<TbUser?> GetByIdWithEmployeeAsync(Guid userId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Position)
            .FirstOrDefaultAsync(u => u.UserId == userId, ct);
    }

    public async Task<TbUser?> GetByIdWithEmployeeReadOnlyAsync(Guid userId, CancellationToken ct = default)
    {
        return await QueryNoTracking()
            .Include(u => u.Employee)
                .ThenInclude(e => e!.Position)
            .Include(u => u.CreatedByEmployee)
            .Include(u => u.UpdatedByEmployee)
            .FirstOrDefaultAsync(u => u.UserId == userId, ct);
    }
}
