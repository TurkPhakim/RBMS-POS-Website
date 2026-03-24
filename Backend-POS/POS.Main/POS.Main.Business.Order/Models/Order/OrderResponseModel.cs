namespace POS.Main.Business.Order.Models.Order;

public class OrderResponseModel
{
    public int OrderId { get; set; }
    public int TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public decimal SubTotal { get; set; }
    public string? Note { get; set; }
    public int ItemCount { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public string? GuestType { get; set; }
    public DateTime CreatedAt { get; set; }
}
