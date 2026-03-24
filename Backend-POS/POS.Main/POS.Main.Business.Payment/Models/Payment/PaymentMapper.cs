using POS.Main.Dal.Entities;

namespace POS.Main.Business.Payment.Models.Payment;

public static class PaymentMapper
{
    public static PaymentResponseModel ToResponse(TbPayment payment)
    {
        return new PaymentResponseModel
        {
            PaymentId = payment.PaymentId,
            OrderBillId = payment.OrderBillId,
            CashierSessionId = payment.CashierSessionId,
            PaymentMethod = payment.PaymentMethod.ToString(),
            AmountDue = payment.AmountDue,
            AmountReceived = payment.AmountReceived,
            ChangeAmount = payment.ChangeAmount,
            SlipImageFileId = payment.SlipImageFileId,
            SlipOcrAmount = payment.SlipOcrAmount,
            SlipVerificationStatus = payment.SlipVerificationStatus.ToString(),
            PaymentReference = payment.PaymentReference,
            PaidAt = payment.PaidAt,
            Note = payment.Note,
            BillNumber = payment.OrderBill?.BillNumber,
            GrandTotal = payment.OrderBill?.GrandTotal ?? 0,
            OrderId = payment.OrderBill?.OrderId ?? 0,
            OrderNumber = payment.OrderBill?.Order?.OrderNumber,
            TableId = payment.OrderBill?.Order?.TableId,
            TableName = payment.OrderBill?.Order?.Table?.TableName,
            ZoneName = payment.OrderBill?.Order?.Table?.Zone?.ZoneName,
            GuestType = payment.OrderBill?.Order?.Table?.GuestType?.ToString(),
            GuestCount = payment.OrderBill?.Order?.GuestCount ?? 0,
        };
    }
}
