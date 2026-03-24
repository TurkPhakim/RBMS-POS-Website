using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class TableRepository : GenericRepository<TbTable>, ITableRepository
{
    public TableRepository(POSMainContext context) : base(context)
    {
    }
}
