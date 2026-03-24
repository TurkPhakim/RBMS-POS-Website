namespace POS.Main.Business.Order.Models.OrderBill;

public class UpdateBillChargesRequestModel
{
    /// <summary>
    /// Service Charge ID — null = ไม่คิด SC (0%)
    /// </summary>
    public int? ServiceChargeId { get; set; }
}
