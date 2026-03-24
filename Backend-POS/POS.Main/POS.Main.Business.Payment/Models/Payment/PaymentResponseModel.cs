namespace POS.Main.Business.Payment.Models.Payment;

public class PaymentResponseModel
{
    public int PaymentId { get; set; }
    public int OrderBillId { get; set; }
    public int CashierSessionId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal AmountDue { get; set; }
    public decimal AmountReceived { get; set; }
    public decimal ChangeAmount { get; set; }
    public int? SlipImageFileId { get; set; }
    public decimal? SlipOcrAmount { get; set; }
    public string SlipVerificationStatus { get; set; } = string.Empty;
    public string? PaymentReference { get; set; }
    public DateTime PaidAt { get; set; }
    public string? Note { get; set; }

    // Bill info
    public string? BillNumber { get; set; }
    public decimal GrandTotal { get; set; }

    // Order info
    public int OrderId { get; set; }
    public string? OrderNumber { get; set; }

    // Table info
    public int? TableId { get; set; }
    public string? TableName { get; set; }
    public string? ZoneName { get; set; }

    // Guest info
    public string? GuestType { get; set; }
    public int GuestCount { get; set; }
}
