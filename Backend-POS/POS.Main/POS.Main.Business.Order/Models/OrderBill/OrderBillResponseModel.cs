namespace POS.Main.Business.Order.Models.OrderBill;

public class OrderBillResponseModel
{
    public int OrderBillId { get; set; }
    public int OrderId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public string BillType { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal TotalDiscountAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal ServiceChargeRate { get; set; }
    public decimal ServiceChargeAmount { get; set; }
    public decimal VatRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
