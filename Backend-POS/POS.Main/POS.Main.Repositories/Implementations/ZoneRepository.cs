using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class ZoneRepository : GenericRepository<TbZone>, IZoneRepository
{
    public ZoneRepository(POSMainContext context) : base(context)
    {
    }
}
