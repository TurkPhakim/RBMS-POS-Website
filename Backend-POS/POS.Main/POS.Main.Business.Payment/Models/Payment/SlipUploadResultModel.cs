namespace POS.Main.Business.Payment.Models.Payment;

public class SlipUploadResultModel
{
    public int OrderBillId { get; set; }
    public int SlipImageFileId { get; set; }
    public decimal? OcrAmount { get; set; }
    public string VerificationStatus { get; set; } = string.Empty;
    public decimal BillGrandTotal { get; set; }

    // ผลตรวจวันที่โอน
    public DateTime? OcrTransferDate { get; set; }
    public bool? IsDateToday { get; set; }

    // ผลตรวจเลขบัญชีปลายทาง
    public string? OcrAccountNumber { get; set; }
    public string? ShopAccountNumber { get; set; }
    public bool? IsAccountMatched { get; set; }
}
