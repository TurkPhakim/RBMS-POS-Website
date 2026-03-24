using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.OrderItem;

public class AddOrderItemsRequestModel
{
    [Required]
    public List<AddOrderItemModel> Items { get; set; } = new();
}

public class AddOrderItemModel
{
    [Required]
    public int MenuId { get; set; }

    [Required]
    [Range(1, 999)]
    public int Quantity { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    public List<AddOrderItemOptionModel> Options { get; set; } = new();
}

public class AddOrderItemOptionModel
{
    [Required]
    public int OptionGroupId { get; set; }

    [Required]
    public int OptionItemId { get; set; }
}
