using POS.Main.Business.Order.Models.Order;
using POS.Main.Business.Order.Models.OrderBill;
using POS.Main.Business.Order.Models.OrderItem;
using POS.Main.Core.Models;

namespace POS.Main.Business.Order.Interfaces;

public interface IOrderService
{
    Task<PaginationResult<OrderResponseModel>> GetOrdersAsync(
        DateTime? dateFrom, DateTime? dateTo, string? status, int? zoneId, int? tableId,
        PaginationModel param, CancellationToken ct = default);

    Task<OrderDetailResponseModel> CreateOrderAsync(CreateOrderRequestModel request, CancellationToken ct = default);

    Task<OrderDetailResponseModel> GetOrderByIdAsync(int orderId, CancellationToken ct = default);

    Task<OrderDetailResponseModel?> GetActiveOrderByTableIdAsync(int tableId, CancellationToken ct = default);

    Task<OrderDetailResponseModel> AddOrderItemsAsync(int orderId, AddOrderItemsRequestModel request, CancellationToken ct = default);

    Task<OrderDetailResponseModel> SendToKitchenAsync(int orderId, CancellationToken ct = default);

    Task VoidOrderItemAsync(int orderItemId, CancellationToken ct = default);

    Task CancelOrderItemAsync(int orderItemId, CancelOrderItemRequestModel request, CancellationToken ct = default);

    Task ServeOrderItemAsync(int orderItemId, CancellationToken ct = default);

    Task<OrderDetailResponseModel> RequestBillAsync(int orderId, CancellationToken ct = default);

    Task<List<OrderBillResponseModel>> SplitBillByItemAsync(int orderId, SplitByItemRequestModel request, CancellationToken ct = default);

    Task<List<OrderBillResponseModel>> SplitBillByAmountAsync(int orderId, SplitByAmountRequestModel request, CancellationToken ct = default);

    Task<List<OrderBillResponseModel>> GetOrderBillsAsync(int orderId, CancellationToken ct = default);

    Task<OrderBillResponseModel> UpdateBillChargesAsync(int orderBillId, UpdateBillChargesRequestModel request, CancellationToken ct = default);

    Task<List<ServiceChargeOptionModel>> GetServiceChargeOptionsAsync(CancellationToken ct = default);
}
