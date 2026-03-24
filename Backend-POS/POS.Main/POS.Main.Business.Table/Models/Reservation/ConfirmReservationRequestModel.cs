using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Reservation;

public class ConfirmReservationRequestModel
{
    [Required(ErrorMessage = "กรุณาเลือกโต๊ะ")]
    public int TableId { get; set; }
}
