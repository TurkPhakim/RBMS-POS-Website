using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbOrder : BaseEntity
{
    public int OrderId { get; set; }

    public int TableId { get; set; }
    public virtual TbTable Table { get; set; } = null!;

    public string OrderNumber { get; set; } = string.Empty;

    public EOrderStatus Status { get; set; } = EOrderStatus.Open;

    public int GuestCount { get; set; }

    public decimal SubTotal { get; set; }

    public string? Note { get; set; }

    public virtual ICollection<TbOrderItem> OrderItems { get; set; } = new List<TbOrderItem>();

    public virtual ICollection<TbOrderBill> OrderBills { get; set; } = new List<TbOrderBill>();
}
