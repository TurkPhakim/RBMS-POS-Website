using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class CashDrawerTransactionRepository : GenericRepository<TbCashDrawerTransaction>, ICashDrawerTransactionRepository
{
    public CashDrawerTransactionRepository(POSMainContext context) : base(context)
    {
    }
}
