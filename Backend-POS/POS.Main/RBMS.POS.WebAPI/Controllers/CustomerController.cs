using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Models;

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
    [ProducesResponseType(typeof(BaseResponseModel<CustomerBillResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBill(string qrToken, CancellationToken ct = default)
        => Success(await _customerService.GetBillByQrTokenAsync(qrToken, ct));

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
        => Success(await _customerService.GetPaymentStatusAsync(qrToken, orderBillId, ct));
}
