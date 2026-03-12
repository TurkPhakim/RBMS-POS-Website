using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class LoginHistoryRepository : GenericRepository<TbLoginHistory>, ILoginHistoryRepository
{
    public LoginHistoryRepository(POSMainContext context) : base(context)
    {
    }
}
