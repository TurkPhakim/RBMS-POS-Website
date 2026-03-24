using Microsoft.AspNetCore.SignalR;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using RBMS.POS.WebAPI.Hubs;

namespace RBMS.POS.WebAPI.Services;

public class NotificationBroadcaster : INotificationBroadcaster
{
    private readonly INotificationService _notificationService;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationBroadcaster(INotificationService notificationService, IHubContext<NotificationHub> hubContext)
    {
        _notificationService = notificationService;
        _hubContext = hubContext;
    }

    public async Task<NotificationResponseModel> SendAndBroadcastAsync(SendNotificationModel model, CancellationToken ct = default)
    {
        var notification = await _notificationService.SendAsync(model, ct);

        await _hubContext.Clients.Group(model.TargetGroup)
            .SendAsync("ReceiveNotification", notification, ct);

        return notification;
    }
}
