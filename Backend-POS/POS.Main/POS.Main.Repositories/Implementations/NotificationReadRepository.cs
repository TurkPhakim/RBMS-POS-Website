using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class NotificationReadRepository : GenericRepository<TbNotificationRead>, INotificationReadRepository
{
    public NotificationReadRepository(POSMainContext context) : base(context)
    {
    }
}
