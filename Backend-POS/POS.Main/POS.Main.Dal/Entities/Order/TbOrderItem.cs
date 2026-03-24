using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbOrderItem : BaseEntity
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }
    public virtual TbOrder Order { get; set; } = null!;

    public int MenuId { get; set; }
    public virtual TbMenu Menu { get; set; } = null!;

    public string MenuNameThai { get; set; } = string.Empty;

    public string MenuNameEnglish { get; set; } = string.Empty;

    public int CategoryType { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal OptionsTotalPrice { get; set; }

    public decimal TotalPrice { get; set; }

    public EOrderItemStatus Status { get; set; } = EOrderItemStatus.Pending;

    public string? Note { get; set; }

    public string OrderedBy { get; set; } = string.Empty;

    public DateTime? SentToKitchenAt { get; set; }

    public DateTime? CookingStartedAt { get; set; }

    public DateTime? ReadyAt { get; set; }

    public DateTime? ServedAt { get; set; }

    public int? CancelledBy { get; set; }
    public virtual TbEmployee? CancelledByEmployee { get; set; }

    public string? CancelReason { get; set; }

    public decimal? CostPrice { get; set; }

    public virtual ICollection<TbOrderItemOption> OrderItemOptions { get; set; } = new List<TbOrderItemOption>();
}
