using Microsoft.AspNetCore.Http;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;

namespace POS.Main.Business.Payment.Interfaces;

public interface ICustomerService
{
    Task<CustomerBillResponseModel> GetBillByQrTokenAsync(string qrToken, int? sessionId, CancellationToken ct = default);
    Task ClaimBillAsync(string qrToken, int orderBillId, int sessionId, ClaimBillRequestModel request, CancellationToken ct = default);
    Task ReleaseBillAsync(string qrToken, int orderBillId, int sessionId, CancellationToken ct = default);
    Task<SlipUploadResultModel> UploadSlipAsync(string qrToken, CustomerUploadSlipRequestModel request, IFormFile slipFile, CancellationToken ct = default);
    Task<string> GetPaymentStatusAsync(string qrToken, int orderBillId, CancellationToken ct = default);
}
