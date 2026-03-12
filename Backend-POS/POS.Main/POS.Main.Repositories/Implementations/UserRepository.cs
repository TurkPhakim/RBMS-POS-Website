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
}
