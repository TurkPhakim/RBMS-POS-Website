using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.OrderItem;

public class CancelOrderItemRequestModel
{
    [Required]
    [MaxLength(500)]
    public string CancelReason { get; set; } = string.Empty;
}
