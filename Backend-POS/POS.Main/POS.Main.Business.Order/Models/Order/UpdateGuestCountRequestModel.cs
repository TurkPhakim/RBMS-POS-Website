using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Order.Models.Order;

public class UpdateGuestCountRequestModel
{
    [Required]
    [Range(1, 100, ErrorMessage = "จำนวนลูกค้าต้องอยู่ระหว่าง 1-100 คน")]
    public int GuestCount { get; set; }
}
