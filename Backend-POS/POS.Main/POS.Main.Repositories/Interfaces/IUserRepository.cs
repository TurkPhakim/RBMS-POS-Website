using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IUserRepository : IGenericRepository<TbUser>
{
    Task<TbUser?> GetByUsernameAsync(string username, CancellationToken ct = default);

    Task<TbUser?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct = default);

    IQueryable<TbUser> GetUsersQuery(string? search, bool? isActive, bool? isLocked, int? positionId);

    Task<TbUser?> GetByIdWithEmployeeAsync(Guid userId, CancellationToken ct = default);

    Task<TbUser?> GetByIdWithEmployeeReadOnlyAsync(Guid userId, CancellationToken ct = default);
}
