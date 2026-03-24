using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.CashierSession;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/cashier/sessions")]
public class CashierSessionsController : BaseController
{
    private readonly ICashierSessionService _cashierSessionService;

    public CashierSessionsController(ICashierSessionService cashierSessionService)
    {
        _cashierSessionService = cashierSessionService;
    }

    [HttpGet("current")]
    [PermissionAuthorize(Permissions.CashierSession.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentSession(CancellationToken ct = default)
        => Success(await _cashierSessionService.GetCurrentSessionAsync(ct));

    [HttpGet("history")]
    [PermissionAuthorize(Permissions.CashierSession.Read)]
    [ProducesResponseType(typeof(PaginationResult<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSessionHistory(
        [FromQuery] PaginationModel param,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int? shiftPeriod = null,
        CancellationToken ct = default)
        => PagedSuccess(await _cashierSessionService.GetSessionHistoryAsync(param, dateFrom, dateTo, shiftPeriod, ct));

    [HttpGet("{cashierSessionId}")]
    [PermissionAuthorize(Permissions.CashierSession.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSessionById(int cashierSessionId, CancellationToken ct = default)
        => Success(await _cashierSessionService.GetSessionByIdAsync(cashierSessionId, ct));

    [HttpPost("open")]
    [PermissionAuthorize(Permissions.CashierSession.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> OpenSession([FromBody] OpenCashierSessionRequestModel request, CancellationToken ct = default)
        => Success(await _cashierSessionService.OpenSessionAsync(request, ct));

    [HttpPost("{cashierSessionId}/cash-in")]
    [PermissionAuthorize(Permissions.CashierSession.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CashIn(int cashierSessionId, [FromBody] CashDrawerTransactionRequestModel request, CancellationToken ct = default)
        => Success(await _cashierSessionService.CashInAsync(cashierSessionId, request, ct));

    [HttpPost("{cashierSessionId}/cash-out")]
    [PermissionAuthorize(Permissions.CashierSession.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CashOut(int cashierSessionId, [FromBody] CashDrawerTransactionRequestModel request, CancellationToken ct = default)
        => Success(await _cashierSessionService.CashOutAsync(cashierSessionId, request, ct));

    [HttpPost("{cashierSessionId}/close")]
    [PermissionAuthorize(Permissions.CashierSession.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<CashierSessionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CloseSession(int cashierSessionId, [FromBody] CloseCashierSessionRequestModel request, CancellationToken ct = default)
        => Success(await _cashierSessionService.CloseSessionAsync(cashierSessionId, request, ct));
}
