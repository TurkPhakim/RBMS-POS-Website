namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerSubmitOrderRequestModel
{
    public List<SelfOrderItemModel> Items { get; set; } = new();
}

public class SelfOrderItemModel
{
    public int MenuId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public List<int>? OptionItemIds { get; set; }
}
