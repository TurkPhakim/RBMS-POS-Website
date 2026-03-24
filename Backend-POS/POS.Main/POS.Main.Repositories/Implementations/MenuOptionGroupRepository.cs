using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class MenuOptionGroupRepository : GenericRepository<TbMenuOptionGroup>, IMenuOptionGroupRepository
{
    public MenuOptionGroupRepository(POSMainContext context) : base(context)
    {
    }
}
