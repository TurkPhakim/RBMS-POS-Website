using POS.Main.Business.Payment.Models.CashierSession;
using POS.Main.Core.Models;

namespace POS.Main.Business.Payment.Interfaces;

public interface ICashierSessionService
{
    Task<CashierSessionResponseModel?> GetCurrentSessionAsync(CancellationToken ct = default);

    Task<CashierSessionResponseModel> GetSessionByIdAsync(int cashierSessionId, CancellationToken ct = default);

    Task<PaginationResult<CashierSessionResponseModel>> GetSessionHistoryAsync(
        PaginationModel param, DateTime? dateFrom = null, DateTime? dateTo = null, int? shiftPeriod = null, CancellationToken ct = default);

    Task<CashierSessionResponseModel> OpenSessionAsync(OpenCashierSessionRequestModel request, CancellationToken ct = default);

    Task<CashierSessionResponseModel> CashInAsync(int cashierSessionId, CashDrawerTransactionRequestModel request, CancellationToken ct = default);

    Task<CashierSessionResponseModel> CashOutAsync(int cashierSessionId, CashDrawerTransactionRequestModel request, CancellationToken ct = default);

    Task<CashierSessionResponseModel> CloseSessionAsync(int cashierSessionId, CloseCashierSessionRequestModel request, CancellationToken ct = default);
}
