using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbOrderBill : BaseEntity
{
    public int OrderBillId { get; set; }

    public int OrderId { get; set; }
    public virtual TbOrder Order { get; set; } = null!;

    public string BillNumber { get; set; } = string.Empty;

    public EBillType BillType { get; set; } = EBillType.Full;

    public decimal SubTotal { get; set; }

    public decimal TotalDiscountAmount { get; set; }

    public decimal NetAmount { get; set; }

    public decimal ServiceChargeRate { get; set; }

    public decimal ServiceChargeAmount { get; set; }

    public decimal VatRate { get; set; }

    public decimal VatAmount { get; set; }

    public decimal GrandTotal { get; set; }

    public EBillStatus Status { get; set; } = EBillStatus.Pending;

    public DateTime? PaidAt { get; set; }
}
