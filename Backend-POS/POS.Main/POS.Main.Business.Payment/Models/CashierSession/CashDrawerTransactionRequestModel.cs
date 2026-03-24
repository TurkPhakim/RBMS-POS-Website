using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.CashierSession;

public class CashDrawerTransactionRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุจำนวนเงิน")]
    [Range(0.01, 9999999999.99, ErrorMessage = "จำนวนเงินต้องมากกว่า 0")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "กรุณาระบุเหตุผล")]
    [MaxLength(500, ErrorMessage = "เหตุผลต้องไม่เกิน 500 ตัวอักษร")]
    public string Reason { get; set; } = string.Empty;
}
