namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerOrderTrackingResponseModel
{
    public int? OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public string? OrderStatus { get; set; }
    public List<CustomerTrackingItemModel> Items { get; set; } = new();
    public decimal SubTotal { get; set; }
    public List<CustomerTrackingBillModel> Bills { get; set; } = new();
}

public class CustomerTrackingItemModel
{
    public int OrderItemId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderedBy { get; set; } = string.Empty;
    public int? MenuImageFileId { get; set; }
    public string? SourceTableName { get; set; }
    public string? Note { get; set; }
    public List<CustomerTrackingOptionModel> Options { get; set; } = new();
}

public class CustomerTrackingOptionModel
{
    public string OptionItemName { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
}

public class CustomerTrackingBillModel
{
    public int OrderBillId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public int SplitIndex { get; set; }
    public int SplitCount { get; set; }
    public string BillType { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal ServiceChargeAmount { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalDiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string Status { get; set; } = string.Empty;
}
