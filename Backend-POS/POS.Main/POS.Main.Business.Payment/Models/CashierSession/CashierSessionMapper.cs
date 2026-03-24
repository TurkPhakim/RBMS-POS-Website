using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Payment.Models.CashierSession;

public static class CashierSessionMapper
{
    public static CashierSessionResponseModel ToResponse(TbCashierSession entity)
    {
        return new CashierSessionResponseModel
        {
            CashierSessionId = entity.CashierSessionId,
            UserId = entity.UserId,
            UserName = entity.User?.Username ?? string.Empty,
            FullNameThai = entity.User?.Employee != null
                ? $"{entity.User.Employee.FirstNameThai} {entity.User.Employee.LastNameThai}"
                : string.Empty,
            PositionName = entity.User?.Employee?.Position?.PositionName ?? string.Empty,
            ImageFileId = entity.User?.Employee?.ImageFileId,
            Status = entity.Status.ToString(),
            OpenedAt = entity.OpenedAt,
            ClosedAt = entity.ClosedAt,
            OpeningCash = entity.OpeningCash,
            ExpectedCash = entity.ExpectedCash,
            ActualCash = entity.ActualCash,
            Variance = entity.Variance,
            TotalCashSales = entity.TotalCashSales,
            TotalQrSales = entity.TotalQrSales,
            BillCount = entity.BillCount,
            ShiftPeriod = entity.ShiftPeriod,
            CashDrawerTransactions = entity.CashDrawerTransactions?
                .OrderByDescending(t => t.CreatedAt)
                .Select(ToTransactionResponse)
                .ToList() ?? new(),
            Payments = entity.Payments?
                .OrderByDescending(p => p.PaidAt)
                .Select(PaymentMapper.ToResponse)
                .ToList() ?? new(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static CashDrawerTransactionResponseModel ToTransactionResponse(TbCashDrawerTransaction entity)
    {
        return new CashDrawerTransactionResponseModel
        {
            CashDrawerTransactionId = entity.CashDrawerTransactionId,
            TransactionType = entity.TransactionType.ToString(),
            Amount = entity.Amount,
            Reason = entity.Reason,
            CreatedAt = entity.CreatedAt
        };
    }
}
