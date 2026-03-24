using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.CashierSession;

public class OpenCashierSessionRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุจำนวนเงินสดเริ่มต้น")]
    [Range(0, 9999999999.99, ErrorMessage = "จำนวนเงินต้องอยู่ระหว่าง 0 - 9,999,999,999.99")]
    public decimal OpeningCash { get; set; }

    [Range(1, 2, ErrorMessage = "ช่วงเวลาต้องเป็น 1 หรือ 2")]
    public int? ShiftPeriod { get; set; }
}
