using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Reservation;

public class UpdateReservationRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อลูกค้า")]
    [StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุเบอร์โทร")]
    [StringLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุวันที่จอง")]
    public DateOnly ReservationDate { get; set; }

    [Required(ErrorMessage = "กรุณาระบุเวลาจอง")]
    public TimeOnly ReservationTime { get; set; }

    [Required(ErrorMessage = "กรุณาระบุจำนวนคน")]
    [Range(1, 50, ErrorMessage = "จำนวนคนต้องอยู่ระหว่าง 1-50")]
    public int GuestCount { get; set; }

    public int? TableId { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}
