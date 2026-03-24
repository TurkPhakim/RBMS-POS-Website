namespace POS.Main.Business.Payment.Models.CashierSession;

public class CashierSessionResponseModel
{
    public int CashierSessionId { get; set; }

    public Guid UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string FullNameThai { get; set; } = string.Empty;

    public string PositionName { get; set; } = string.Empty;

    public int? ImageFileId { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime OpenedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public decimal OpeningCash { get; set; }

    public decimal ExpectedCash { get; set; }

    public decimal? ActualCash { get; set; }

    public decimal? Variance { get; set; }

    public decimal TotalCashSales { get; set; }

    public decimal TotalQrSales { get; set; }

    public int BillCount { get; set; }

    public int? ShiftPeriod { get; set; }

    public decimal TotalSales => TotalCashSales + TotalQrSales;

    public List<CashDrawerTransactionResponseModel> CashDrawerTransactions { get; set; } = new();

    public List<Payment.PaymentResponseModel> Payments { get; set; } = new();

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public class CashDrawerTransactionResponseModel
{
    public int CashDrawerTransactionId { get; set; }

    public string TransactionType { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Reason { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
