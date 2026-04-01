using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Attributes;

namespace RBMS.POS.WebAPI.Controllers;

[Route("api/customer")]
[AllowAnonymous]
public class CustomerController : BaseController
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet("{qrToken}/bill")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<CustomerBillResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBill(string qrToken, CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        return Success(await _customerService.GetBillByQrTokenAsync(qrToken, sessionId, ct));
    }

    [HttpPost("{qrToken}/bills/{orderBillId}/claim")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClaimBill(
        string qrToken,
        int orderBillId,
        [FromBody] ClaimBillRequestModel request,
        CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        await _customerService.ClaimBillAsync(qrToken, orderBillId, sessionId, request, ct);
        return Success();
    }

    [HttpPost("{qrToken}/bills/{orderBillId}/release")]
    [CustomerAuthorize]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReleaseBill(
        string qrToken,
        int orderBillId,
        CancellationToken ct = default)
    {
        var sessionId = GetCustomerSessionId();
        await _customerService.ReleaseBillAsync(qrToken, orderBillId, sessionId, ct);
        return Success();
    }

    [HttpPost("{qrToken}/upload-slip")]
    [RequestSizeLimit(10_485_760)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(BaseResponseModel<SlipUploadResultModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadSlip(
        string qrToken,
        [FromForm] CustomerUploadSlipRequestModel request,
        IFormFile slipFile,
        CancellationToken ct = default)
        => Success(await _customerService.UploadSlipAsync(qrToken, request, slipFile, ct));

    [HttpGet("{qrToken}/bill/{orderBillId}/status")]
    [ProducesResponseType(typeof(BaseResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentStatus(string qrToken, int orderBillId, CancellationToken ct = default)
        => Success<string>(await _customerService.GetPaymentStatusAsync(qrToken, orderBillId, ct));

    private int GetCustomerSessionId()
        => (int)HttpContext.Items["CustomerSessionId"]!;
}
