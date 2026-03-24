using POS.Main.Dal;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.Interfaces;

namespace POS.Main.Repositories.Implementations;

public class NotificationRepository : GenericRepository<TbNotification>, INotificationRepository
{
    public NotificationRepository(POSMainContext context) : base(context)
    {
    }
}
