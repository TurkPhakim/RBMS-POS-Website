namespace POS.Main.Business.Order.Models.Order;

public class OrderLinkedTableModel
{
    public string TableName { get; set; } = string.Empty;
    public int GuestCount { get; set; }
    public bool IsPrimary { get; set; }
}
