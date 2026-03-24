using POS.Main.Dal.Entities;

namespace POS.Main.Business.Order.Models.OrderBill;

public static class OrderBillMapper
{
    public static OrderBillResponseModel ToResponse(TbOrderBill entity)
    {
        return new OrderBillResponseModel
        {
            OrderBillId = entity.OrderBillId,
            OrderId = entity.OrderId,
            BillNumber = entity.BillNumber,
            BillType = entity.BillType.ToString(),
            SubTotal = entity.SubTotal,
            TotalDiscountAmount = entity.TotalDiscountAmount,
            NetAmount = entity.NetAmount,
            ServiceChargeRate = entity.ServiceChargeRate,
            ServiceChargeAmount = entity.ServiceChargeAmount,
            VatRate = entity.VatRate,
            VatAmount = entity.VatAmount,
            GrandTotal = entity.GrandTotal,
            Status = entity.Status.ToString(),
            PaidAt = entity.PaidAt,
            CreatedAt = entity.CreatedAt
        };
    }
}
