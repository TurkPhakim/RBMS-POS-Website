using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class OrderBillRepository : GenericRepository<TbOrderBill>, IOrderBillRepository
{
    public OrderBillRepository(POSMainContext context) : base(context)
    {
    }
}
