using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class CashierSessionRepository : GenericRepository<TbCashierSession>, ICashierSessionRepository
{
    public CashierSessionRepository(POSMainContext context) : base(context)
    {
    }
}
