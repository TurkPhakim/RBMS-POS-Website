using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Payment.Models.Payment;

public class ConfirmQrPaymentRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุ OrderBillId")]
    public int OrderBillId { get; set; }

    /// <summary>FileId ของรูปสลิป (จาก Upload Slip step)</summary>
    public int? SlipImageFileId { get; set; }

    /// <summary>ยอดเงินที่ OCR อ่านได้ (จาก Upload Slip step)</summary>
    public decimal? OcrAmount { get; set; }

    [MaxLength(200, ErrorMessage = "เลขอ้างอิงต้องไม่เกิน 200 ตัวอักษร")]
    public string? PaymentReference { get; set; }

    [MaxLength(500, ErrorMessage = "หมายเหตุต้องไม่เกิน 500 ตัวอักษร")]
    public string? Note { get; set; }

    /// <summary>ถ้า Cashier override ยอด (Manual verification)</summary>
    public decimal? ManualAmount { get; set; }
}
