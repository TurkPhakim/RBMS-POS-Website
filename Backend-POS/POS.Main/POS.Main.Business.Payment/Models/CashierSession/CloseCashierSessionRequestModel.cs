using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.CashierSession;

public class CloseCashierSessionRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุจำนวนเงินสดจริง")]
    [Range(0, 9999999999.99, ErrorMessage = "จำนวนเงินต้องอยู่ระหว่าง 0 - 9,999,999,999.99")]
    public decimal ActualCash { get; set; }
}
