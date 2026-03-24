namespace POS.Main.Business.Payment.Models.Payment;

public class ReceiptDataModel
{
    // Shop info
    public string ShopNameThai { get; set; } = string.Empty;
    public string ShopNameEnglish { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string TaxId { get; set; } = string.Empty;
    public string? ReceiptHeaderText { get; set; }
    public string? ReceiptFooterText { get; set; }

    // Payment info
    public int PaymentId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime PaidAt { get; set; }

    // Bill info
    public string BillNumber { get; set; } = string.Empty;
    public string? OrderNumber { get; set; }
    public string? TableName { get; set; }
    public decimal SubTotal { get; set; }
    public decimal ServiceChargeRate { get; set; }
    public decimal ServiceChargeAmount { get; set; }
    public decimal VatRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalDiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }

    // Payment amounts
    public decimal AmountReceived { get; set; }
    public decimal ChangeAmount { get; set; }

    // Cashier
    public string? CashierName { get; set; }

    // Items
    public List<ReceiptItemModel> Items { get; set; } = new();
}

public class ReceiptItemModel
{
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public List<string> Options { get; set; } = new();
}
