using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbPayment : BaseEntity
{
    public int PaymentId { get; set; }

    public int OrderBillId { get; set; }
    public virtual TbOrderBill OrderBill { get; set; } = null!;

    public int CashierSessionId { get; set; }
    public virtual TbCashierSession CashierSession { get; set; } = null!;

    public EPaymentMethod PaymentMethod { get; set; }

    public decimal AmountDue { get; set; }

    public decimal AmountReceived { get; set; }

    public decimal ChangeAmount { get; set; }

    // Slip (QR Payment only)
    public int? SlipImageFileId { get; set; }
    public virtual TbFile? SlipImageFile { get; set; }

    public decimal? SlipOcrAmount { get; set; }

    public ESlipVerificationStatus SlipVerificationStatus { get; set; } = ESlipVerificationStatus.None;

    public string? PaymentReference { get; set; }

    public DateTime PaidAt { get; set; }

    public string? Note { get; set; }
}
