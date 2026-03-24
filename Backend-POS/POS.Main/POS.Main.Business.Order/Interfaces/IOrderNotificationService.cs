namespace POS.Main.Business.Order.Interfaces;

public interface IOrderNotificationService
{
    Task NotifyNewOrderItemsAsync(int orderId, int tableId, CancellationToken ct = default);
    Task NotifyItemStatusChangedAsync(int orderId, int orderItemId, string newStatus, CancellationToken ct = default);
    Task NotifyItemCancelledAsync(int orderId, int orderItemId, CancellationToken ct = default);
    Task NotifyOrderUpdatedAsync(int orderId, string newStatus, CancellationToken ct = default);
    Task NotifyTableStatusChangedAsync(int tableId, string newStatus, CancellationToken ct = default);
    Task NotifyTableOrderRefreshAsync(int tableId, CancellationToken ct = default);
    Task NotifySlipUploadedAsync(int tableId, int orderBillId, CancellationToken ct = default);
    Task NotifyPaymentCompletedAsync(int tableId, int orderBillId, CancellationToken ct = default);
}
