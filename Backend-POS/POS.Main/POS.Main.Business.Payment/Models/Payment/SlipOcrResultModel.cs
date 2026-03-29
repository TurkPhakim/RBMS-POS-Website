namespace POS.Main.Business.Payment.Models.Payment;

/// <summary>ผลลัพธ์ภายในจาก OCR (ไม่ expose ออก API)</summary>
public class SlipOcrResultModel
{
    public decimal? Amount { get; set; }
    public DateTime? TransferDate { get; set; }
    public string? AccountNumber { get; set; }
}
