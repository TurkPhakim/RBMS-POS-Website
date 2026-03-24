namespace POS.Main.Business.Order.Models.OrderItem;

public class OrderItemResponseModel
{
    public int OrderItemId { get; set; }
    public int MenuId { get; set; }
    public int? MenuImageFileId { get; set; }
    public string MenuNameThai { get; set; } = string.Empty;
    public string MenuNameEnglish { get; set; } = string.Empty;
    public int CategoryType { get; set; }
    public string? SubCategoryName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal OptionsTotalPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string OrderedBy { get; set; } = string.Empty;
    public DateTime? SentToKitchenAt { get; set; }
    public DateTime? CookingStartedAt { get; set; }
    public DateTime? ReadyAt { get; set; }
    public DateTime? ServedAt { get; set; }
    public string? CancelledByName { get; set; }
    public string? CancelReason { get; set; }
    public List<OrderItemOptionResponseModel> Options { get; set; } = new();
}

public class OrderItemOptionResponseModel
{
    public int OrderItemOptionId { get; set; }
    public int OptionGroupId { get; set; }
    public string OptionGroupName { get; set; } = string.Empty;
    public int OptionItemId { get; set; }
    public string OptionItemName { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
}
