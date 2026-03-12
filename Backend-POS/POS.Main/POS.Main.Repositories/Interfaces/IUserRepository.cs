using POS.Main.Dal.Entities;

namespace POS.Main.Repositories.Interfaces;

public interface IUserRepository : IGenericRepository<TbUser>
{
    Task<TbUser?> GetByUsernameAsync(string username, CancellationToken ct = default);
}
