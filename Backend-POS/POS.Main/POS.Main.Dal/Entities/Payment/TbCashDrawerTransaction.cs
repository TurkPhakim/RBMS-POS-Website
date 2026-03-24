using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbCashDrawerTransaction : BaseEntity
{
    public int CashDrawerTransactionId { get; set; }

    public int CashierSessionId { get; set; }
    public virtual TbCashierSession CashierSession { get; set; } = null!;

    public ECashDrawerTransactionType TransactionType { get; set; }

    public decimal Amount { get; set; }

    public string Reason { get; set; } = string.Empty;
}
