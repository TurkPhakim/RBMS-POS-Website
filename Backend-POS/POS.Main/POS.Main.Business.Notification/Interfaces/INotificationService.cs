using POS.Main.Business.Notification.Models;

namespace POS.Main.Business.Notification.Interfaces;

public interface INotificationService
{
    Task<NotificationResponseModel> SendAsync(SendNotificationModel model, CancellationToken ct = default);
    Task<List<NotificationResponseModel>> GetNotificationsAsync(Guid userId, string? eventType, int? tableId, int limit, int? before, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default);
    Task MarkReadAsync(int notificationId, Guid userId, CancellationToken ct = default);
    Task MarkAllReadAsync(Guid userId, CancellationToken ct = default);
    Task ClearAllAsync(Guid userId, CancellationToken ct = default);
}
