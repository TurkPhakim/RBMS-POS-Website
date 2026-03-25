using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Order.Models.Order;
using POS.Main.Business.Order.Models.OrderBill;
using POS.Main.Business.Order.Models.OrderItem;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/order/orders")]
public class OrdersController : BaseController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Order.Read)]
    [ProducesResponseType(typeof(PaginationResult<OrderResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders(
        [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo,
        [FromQuery] string? status, [FromQuery] int? zoneId, [FromQuery] int? tableId,
        [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _orderService.GetOrdersAsync(dateFrom, dateTo, status, zoneId, tableId, param, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.Order.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderRequestModel request, CancellationToken ct = default)
        => Success(await _orderService.CreateOrderAsync(request, ct));

    [HttpGet("{orderId}")]
    [PermissionAuthorize(Permissions.Order.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrder(int orderId, CancellationToken ct = default)
        => Success(await _orderService.GetOrderByIdAsync(orderId, ct));

    [HttpGet("table/{tableId}")]
    [PermissionAuthorize(Permissions.Order.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveOrderByTable(int tableId, CancellationToken ct = default)
        => Success(await _orderService.GetActiveOrderByTableIdAsync(tableId, ct));

    [HttpPost("{orderId}/items")]
    [PermissionAuthorize(Permissions.Order.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddItems(
        int orderId, [FromBody] AddOrderItemsRequestModel request, CancellationToken ct = default)
        => Success(await _orderService.AddOrderItemsAsync(orderId, request, ct));

    [HttpPost("{orderId}/send-kitchen")]
    [PermissionAuthorize(Permissions.Order.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendToKitchen(int orderId, CancellationToken ct = default)
        => Success(await _orderService.SendToKitchenAsync(orderId, ct));

    [HttpPost("{orderId}/request-bill")]
    [PermissionAuthorize(Permissions.Order.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestBill(int orderId, CancellationToken ct = default)
        => Success(await _orderService.RequestBillAsync(orderId, ct));

    [HttpPost("{orderId}/void-bill")]
    [PermissionAuthorize(Permissions.Order.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> VoidBill(int orderId, CancellationToken ct = default)
        => Success(await _orderService.VoidBillAsync(orderId, ct));

    [HttpPut("items/{orderItemId}/void")]
    [PermissionAuthorize(Permissions.Order.Update)]
    public async Task<IActionResult> VoidItem(int orderItemId, CancellationToken ct = default)
    {
        await _orderService.VoidOrderItemAsync(orderItemId, ct);
        return Success("Void รายการสำเร็จ");
    }

    [HttpPut("items/{orderItemId}/cancel")]
    [PermissionAuthorize(Permissions.Order.Delete)]
    public async Task<IActionResult> CancelItem(
        int orderItemId, [FromBody] CancelOrderItemRequestModel request, CancellationToken ct = default)
    {
        await _orderService.CancelOrderItemAsync(orderItemId, request, ct);
        return Success("ยกเลิกรายการสำเร็จ");
    }

    [HttpPut("items/{orderItemId}/serve")]
    [PermissionAuthorize(Permissions.Order.Update)]
    public async Task<IActionResult> ServeItem(int orderItemId, CancellationToken ct = default)
    {
        await _orderService.ServeOrderItemAsync(orderItemId, ct);
        return Success("เสิร์ฟรายการสำเร็จ");
    }

    [HttpPost("{orderId}/split/by-item")]
    [PermissionAuthorize(Permissions.Order.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<List<OrderBillResponseModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SplitByItem(
        int orderId, [FromBody] SplitByItemRequestModel request, CancellationToken ct = default)
        => Success(await _orderService.SplitBillByItemAsync(orderId, request, ct));

    [HttpPost("{orderId}/split/by-amount")]
    [PermissionAuthorize(Permissions.Order.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<List<OrderBillResponseModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SplitByAmount(
        int orderId, [FromBody] SplitByAmountRequestModel request, CancellationToken ct = default)
        => Success(await _orderService.SplitBillByAmountAsync(orderId, request, ct));

    [HttpGet("{orderId}/bills")]
    [PermissionAuthorize(Permissions.Order.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<List<OrderBillResponseModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBills(int orderId, CancellationToken ct = default)
        => Success(await _orderService.GetOrderBillsAsync(orderId, ct));

    [HttpPut("bills/{orderBillId}/update-charges")]
    [PermissionAuthorize(Permissions.Payment.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<OrderBillResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateBillCharges(
        int orderBillId, [FromBody] UpdateBillChargesRequestModel request, CancellationToken ct = default)
        => Success(await _orderService.UpdateBillChargesAsync(orderBillId, request, ct));

}
