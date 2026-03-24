using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class FloorObjectRepository : GenericRepository<TbFloorObject>, IFloorObjectRepository
{
    public FloorObjectRepository(POSMainContext context) : base(context)
    {
    }
}
