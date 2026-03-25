using Microsoft.AspNetCore.Http;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Models;

namespace POS.Main.Business.Payment.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseModel> PayCashAsync(CashPaymentRequestModel request, CancellationToken ct = default);
    Task<SlipUploadResultModel> UploadSlipAsync(UploadSlipRequestModel request, IFormFile slipFile, CancellationToken ct = default);
    Task<PaymentResponseModel> ConfirmQrPaymentAsync(ConfirmQrPaymentRequestModel request, CancellationToken ct = default);
    Task<List<PaymentResponseModel>> GetPaymentsByOrderAsync(int orderId, CancellationToken ct = default);
    Task<PaymentResponseModel> GetPaymentByIdAsync(int paymentId, CancellationToken ct = default);
    Task<PaginationResult<PaymentResponseModel>> GetPaymentHistoryAsync(PaginationModel param, CancellationToken ct = default);
    Task<ReceiptDataModel> GetReceiptDataAsync(int paymentId, CancellationToken ct = default);
    Task<ReceiptDataModel> GetConsolidatedReceiptDataAsync(int orderId, CancellationToken ct = default);
}
