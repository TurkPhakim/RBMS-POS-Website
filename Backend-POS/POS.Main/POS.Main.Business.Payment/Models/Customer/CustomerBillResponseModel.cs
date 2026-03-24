namespace POS.Main.Business.Payment.Models.Customer;

public class CustomerBillResponseModel
{
    public string TableName { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public List<CustomerOrderItemModel> Items { get; set; } = [];
    public List<CustomerBillSummaryModel> Bills { get; set; } = [];
}

public class CustomerBillSummaryModel
{
    public int OrderBillId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal ServiceChargeAmount { get; set; }
    public decimal VatAmount { get; set; }
    public decimal TotalDiscountAmount { get; set; }
    public decimal GrandTotal { get; set; }
}

public class CustomerOrderItemModel
{
    public int CategoryType { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public List<string> Options { get; set; } = [];
}
