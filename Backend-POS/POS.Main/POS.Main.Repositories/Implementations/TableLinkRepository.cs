using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class TableLinkRepository : GenericRepository<TbTableLink>, ITableLinkRepository
{
    public TableLinkRepository(POSMainContext context) : base(context)
    {
    }
}
