using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbCashierSession : BaseEntity
{
    public int CashierSessionId { get; set; }

    public Guid UserId { get; set; }
    public virtual TbUser User { get; set; } = null!;

    public ECashierSessionStatus Status { get; set; } = ECashierSessionStatus.Open;

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

    public virtual ICollection<TbCashDrawerTransaction> CashDrawerTransactions { get; set; } = new List<TbCashDrawerTransaction>();

    public virtual ICollection<TbPayment> Payments { get; set; } = new List<TbPayment>();
}
