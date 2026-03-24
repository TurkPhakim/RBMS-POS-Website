using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.Order;

public class CreateOrderRequestModel
{
    [Required]
    public int TableId { get; set; }

    [Required]
    [Range(1, 100)]
    public int GuestCount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
