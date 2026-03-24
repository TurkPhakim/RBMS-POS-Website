namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerOrderTrackingResponseModel
{
    public int? OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public List<CustomerTrackingItemModel> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
}

public class CustomerTrackingItemModel
{
    public int OrderItemId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderedBy { get; set; } = string.Empty;
}
