using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/payment/payments")]
public class PaymentsController : BaseController
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>ชำระเงินสด</summary>
    [HttpPost("cash")]
    [PermissionAuthorize(Permissions.Payment.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<PaymentResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> PayCash([FromBody] CashPaymentRequestModel request, CancellationToken ct = default)
        => Success(await _paymentService.PayCashAsync(request, ct));

    /// <summary>อัพโหลดสลิป + OCR อ่านยอดเงิน</summary>
    [HttpPost("qr/upload-slip")]
    [PermissionAuthorize(Permissions.Payment.Create)]
    [RequestSizeLimit(10_485_760)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(BaseResponseModel<SlipUploadResultModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadSlip([FromForm] UploadSlipRequestModel request, IFormFile slipFile, CancellationToken ct = default)
        => Success(await _paymentService.UploadSlipAsync(request, slipFile, ct));

    /// <summary>ยืนยันชำระเงิน QR</summary>
    [HttpPost("qr/confirm")]
    [PermissionAuthorize(Permissions.Payment.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<PaymentResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ConfirmQrPayment([FromBody] ConfirmQrPaymentRequestModel request, CancellationToken ct = default)
        => Success(await _paymentService.ConfirmQrPaymentAsync(request, ct));

    /// <summary>ดูรายการชำระเงินของ Order</summary>
    [HttpGet("order/{orderId}")]
    [PermissionAuthorize(Permissions.Payment.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<List<PaymentResponseModel>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByOrder(int orderId, CancellationToken ct = default)
        => Success(await _paymentService.GetPaymentsByOrderAsync(orderId, ct));

    /// <summary>ดูรายละเอียดการชำระเงิน</summary>
    [HttpGet("{paymentId}")]
    [PermissionAuthorize(Permissions.Payment.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<PaymentResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(int paymentId, CancellationToken ct = default)
        => Success(await _paymentService.GetPaymentByIdAsync(paymentId, ct));

    /// <summary>ข้อมูลใบเสร็จ</summary>
    [HttpGet("{paymentId}/receipt")]
    [PermissionAuthorize(Permissions.Payment.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ReceiptDataModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReceiptData(int paymentId, CancellationToken ct = default)
        => Success(await _paymentService.GetReceiptDataAsync(paymentId, ct));

    /// <summary>ใบเสร็จรวมทุกบิลของออเดอร์</summary>
    [HttpGet("order/{orderId}/consolidated-receipt")]
    [PermissionAuthorize(Permissions.Payment.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ReceiptDataModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConsolidatedReceipt(int orderId, CancellationToken ct = default)
        => Success(await _paymentService.GetConsolidatedReceiptDataAsync(orderId, ct));

    /// <summary>ประวัติการชำระเงิน</summary>
    [HttpGet("history")]
    [PermissionAuthorize(Permissions.Payment.Read)]
    [ProducesResponseType(typeof(PaginationResult<PaymentResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistory([FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _paymentService.GetPaymentHistoryAsync(param, ct));
}
