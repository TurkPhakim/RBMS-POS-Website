namespace POS.Main.Business.Order.Models.Kitchen;

public class BatchItemRequestModel
{
    public int CategoryType { get; set; }
    public List<int> OrderItemIds { get; set; } = new();
}
