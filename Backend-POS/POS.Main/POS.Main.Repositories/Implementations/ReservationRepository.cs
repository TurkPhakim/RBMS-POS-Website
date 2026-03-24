using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class ReservationRepository : GenericRepository<TbReservation>, IReservationRepository
{
    public ReservationRepository(POSMainContext context) : base(context)
    {
    }
}
