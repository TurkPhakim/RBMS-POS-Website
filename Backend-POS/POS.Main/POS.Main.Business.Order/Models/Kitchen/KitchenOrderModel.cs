namespace POS.Main.Business.Order.Models.Kitchen;

public class KitchenOrderModel
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string? ZoneColor { get; set; }
    public DateTime? OpenedAt { get; set; }
    public List<KitchenOrderItemModel> Items { get; set; } = new();
}

public class KitchenOrderItemModel
{
    public int OrderItemId { get; set; }
    public int MenuId { get; set; }
    public string MenuNameThai { get; set; } = string.Empty;
    public string MenuNameEnglish { get; set; } = string.Empty;
    public int CategoryType { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? SentToKitchenAt { get; set; }
    public DateTime? CookingStartedAt { get; set; }
    public DateTime? ReadyAt { get; set; }
    public string? CancelReason { get; set; }
    public List<KitchenOptionModel> Options { get; set; } = new();
}

public class KitchenOptionModel
{
    public string OptionGroupName { get; set; } = string.Empty;
    public string OptionItemName { get; set; } = string.Empty;
}
