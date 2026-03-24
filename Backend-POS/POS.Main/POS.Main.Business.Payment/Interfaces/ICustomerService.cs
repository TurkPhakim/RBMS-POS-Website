using Microsoft.AspNetCore.Http;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;

namespace POS.Main.Business.Payment.Interfaces;

public interface ICustomerService
{
    Task<CustomerBillResponseModel> GetBillByQrTokenAsync(string qrToken, CancellationToken ct = default);
    Task<SlipUploadResultModel> UploadSlipAsync(string qrToken, CustomerUploadSlipRequestModel request, IFormFile slipFile, CancellationToken ct = default);
    Task<string> GetPaymentStatusAsync(string qrToken, int orderBillId, CancellationToken ct = default);
}
