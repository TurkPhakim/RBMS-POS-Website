using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.Payment;

public class CashPaymentRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุ OrderBillId")]
    public int OrderBillId { get; set; }

    [Required(ErrorMessage = "กรุณาระบุจำนวนเงินที่รับ")]
    [Range(0.01, double.MaxValue, ErrorMessage = "จำนวนเงินต้องมากกว่า 0")]
    public decimal AmountReceived { get; set; }

    [MaxLength(500, ErrorMessage = "หมายเหตุต้องไม่เกิน 500 ตัวอักษร")]
    public string? Note { get; set; }
}
