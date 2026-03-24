using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.OrderBill;

public class SplitByItemRequestModel
{
    [Required]
    public List<SplitBillGroup> Groups { get; set; } = new();
}

public class SplitBillGroup
{
    [Required]
    public List<int> OrderItemIds { get; set; } = new();
}
