using POS.Main.Business.Notification.Models;

namespace POS.Main.Business.Notification.Interfaces;

public interface INotificationBroadcaster
{
    Task<NotificationResponseModel> SendAndBroadcastAsync(SendNotificationModel model, CancellationToken ct = default);
}
