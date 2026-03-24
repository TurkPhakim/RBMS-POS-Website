namespace POS.Main.Business.Order.Models.OrderBill;

public class ServiceChargeOptionModel
{
    public int ServiceChargeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PercentageRate { get; set; }
}
