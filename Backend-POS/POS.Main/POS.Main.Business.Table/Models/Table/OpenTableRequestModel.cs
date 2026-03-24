using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Table;

public class OpenTableRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุประเภทลูกค้า")]
    public string GuestType { get; set; } = "WalkIn";

    [Required(ErrorMessage = "กรุณาระบุจำนวนลูกค้า")]
    [Range(1, 100, ErrorMessage = "จำนวนลูกค้าต้องอยู่ระหว่าง 1-100")]
    public int GuestCount { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}
