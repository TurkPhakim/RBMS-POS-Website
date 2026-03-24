using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class OrderRepository : GenericRepository<TbOrder>, IOrderRepository
{
    public OrderRepository(POSMainContext context) : base(context)
    {
    }
}
