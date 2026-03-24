using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class OrderItemRepository : GenericRepository<TbOrderItem>, IOrderItemRepository
{
    public OrderItemRepository(POSMainContext context) : base(context)
    {
    }
}
