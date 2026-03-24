using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Business.Payment.Models.SelfOrder;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Attributes;

namespace RBMS.POS.WebAPI.Controllers;

[Route("api/customer")]
[AllowAnonymous]
public class SelfOrderController : BaseController
{
    private readonly ISelfOrderService _selfOrderService;

    public SelfOrderController(ISelfOrderService selfOrderService)
    {
        _selfOrderService = selfOrderService;
    }

    [HttpPost("auth")]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerAuthResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Authenticate(
        [FromBody] CustomerAuthRequestModel request,
        CancellationToken ct = default)
        => Success(await _selfOrderService.AuthenticateAsync(request, ct));

    [HttpPost("nickname")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetNickname(
        [FromBody] SetNicknameRequestModel request,
        CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        await _selfOrderService.SetNicknameAsync(sessionId, request.Nickname, ct);
        return Success();
    }

    [HttpGet("menu/categories")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerMenuCategoriesResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenuCategories(CancellationToken ct = default)
        => Success(await _selfOrderService.GetMenuCategoriesAsync(ct));

    [HttpGet("menu/items")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<List<CustomerMenuItemResponseModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenuItems(
        [FromQuery] int? categoryType,
        [FromQuery] int? subCategoryId,
        [FromQuery] string? search,
        CancellationToken ct = default)
        => Success(await _selfOrderService.GetMenuItemsAsync(categoryType, subCategoryId, search, ct));

    [HttpGet("menu/items/{menuId}")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerMenuDetailResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenuDetail(int menuId, CancellationToken ct = default)
        => Success(await _selfOrderService.GetMenuDetailAsync(menuId, ct));

    [HttpPost("orders")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerOrderResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SubmitOrder(
        [FromBody] CustomerSubmitOrderRequestModel request,
        CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        var tableId = GetCustomerTableId();
        return Success(await _selfOrderService.SubmitOrderAsync(sessionId, tableId, request, ct));
    }

    [HttpGet("orders")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerOrderTrackingResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders(CancellationToken ct = default)
    {
        var tableId = GetCustomerTableId();
        return Success(await _selfOrderService.GetOrdersAsync(tableId, ct));
    }

    [HttpPost("call-waiter")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CallWaiter(CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        var tableId = GetCustomerTableId();
        await _selfOrderService.CallWaiterAsync(sessionId, tableId, ct);
        return Success();
    }

    [HttpPost("request-bill")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestBill(CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        var tableId = GetCustomerTableId();
        await _selfOrderService.RequestBillAsync(sessionId, tableId, ct);
        return Success();
    }

    [HttpPost("request-cash")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestCashPayment(CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        var tableId = GetCustomerTableId();
        await _selfOrderService.RequestCashPaymentAsync(sessionId, tableId, ct);
        return Success();
    }

    [HttpPost("request-split-bill")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RequestSplitBill(
        [FromBody] RequestSplitBillModel request,
        CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        var tableId = GetCustomerTableId();
        await _selfOrderService.RequestSplitBillAsync(sessionId, tableId, request, ct);
        return Success();
    }

    [HttpGet("receipt/{orderBillId}")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<ReceiptDataModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReceipt(int orderBillId, CancellationToken ct = default)
    {
        var tableId = GetCustomerTableId();
        return Success(await _selfOrderService.GetCustomerReceiptAsync(tableId, orderBillId, ct));
    }

    private int GetCustomerSessionId()
        => (int)HttpContext.Items["CustomerSessionId"]!;

    private int GetCustomerTableId()
        => (int)HttpContext.Items["CustomerTableId"]!;
}
