namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerOrderResponseModel
{
    public int OrderId { get; set; }
    public List<CustomerOrderItemResultModel> Items { get; set; } = new();
    public decimal TotalPrice { get; set; }
}

public class CustomerOrderItemResultModel
{
    public int OrderItemId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
