using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class OrderItemOptionRepository : GenericRepository<TbOrderItemOption>, IOrderItemOptionRepository
{
    public OrderItemOptionRepository(POSMainContext context) : base(context)
    {
    }
}
