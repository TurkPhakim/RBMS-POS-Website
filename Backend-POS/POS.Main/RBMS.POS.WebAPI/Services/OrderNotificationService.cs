using Microsoft.AspNetCore.SignalR;
using POS.Main.Business.Order.Interfaces;
using RBMS.POS.WebAPI.Hubs;

namespace RBMS.POS.WebAPI.Services;

public class OrderNotificationService : IOrderNotificationService
{
    private readonly IHubContext<OrderHub> _hubContext;

    public OrderNotificationService(IHubContext<OrderHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewOrderItemsAsync(int orderId, int tableId, CancellationToken ct = default)
    {
        await _hubContext.Clients.Groups("kitchen", $"table_{tableId}")
            .SendAsync("NewOrderItems", new { orderId, tableId }, ct);
    }

    public async Task NotifyItemStatusChangedAsync(int orderId, int orderItemId, string newStatus, CancellationToken ct = default)
    {
        await _hubContext.Clients.Groups("kitchen", "floor")
            .SendAsync("ItemStatusChanged", new { orderId, orderItemId, status = newStatus }, ct);
    }

    public async Task NotifyItemCancelledAsync(int orderId, int orderItemId, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group("kitchen")
            .SendAsync("ItemCancelled", new { orderId, orderItemId }, ct);
    }

    public async Task NotifyOrderUpdatedAsync(int orderId, string newStatus, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group("floor")
            .SendAsync("OrderUpdated", new { orderId, status = newStatus }, ct);
    }

    public async Task NotifyTableStatusChangedAsync(int tableId, string newStatus, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group("floor")
            .SendAsync("TableStatusChanged", new { tableId, status = newStatus }, ct);
    }

    public async Task NotifyTableOrderRefreshAsync(int tableId, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group($"table_{tableId}")
            .SendAsync("RefreshOrders", new { tableId }, ct);
    }

    public async Task NotifySlipUploadedAsync(int tableId, int orderBillId, CancellationToken ct = default)
    {
        await _hubContext.Clients.Groups("floor", $"table_{tableId}")
            .SendAsync("SlipUploaded", new { tableId, orderBillId }, ct);
    }

    public async Task NotifyPaymentCompletedAsync(int tableId, int orderBillId, CancellationToken ct = default)
    {
        await _hubContext.Clients.Groups("floor", $"table_{tableId}")
            .SendAsync("PaymentCompleted", new { tableId, orderBillId }, ct);
    }
}
