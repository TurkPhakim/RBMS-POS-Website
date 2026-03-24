using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.Payment;

public class UploadSlipRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุ OrderBillId")]
    public int OrderBillId { get; set; }

    [MaxLength(200, ErrorMessage = "เลขอ้างอิงต้องไม่เกิน 200 ตัวอักษร")]
    public string? PaymentReference { get; set; }
}
