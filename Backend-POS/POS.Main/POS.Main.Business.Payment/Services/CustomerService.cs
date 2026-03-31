using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using System.Text.RegularExpressions;
using POS.Main.Core.Helpers;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Payment.Services;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileService _fileService;
    private readonly ISlipOcrService _slipOcrService;
    private readonly IOrderNotificationService _notificationService;
    private readonly INotificationBroadcaster _notificationBroadcaster;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(
        IUnitOfWork unitOfWork,
        IFileService fileService,
        ISlipOcrService slipOcrService,
        IOrderNotificationService notificationService,
        INotificationBroadcaster notificationBroadcaster,
        ILogger<CustomerService> logger)
    {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
        _slipOcrService = slipOcrService;
        _notificationService = notificationService;
        _notificationBroadcaster = notificationBroadcaster;
        _logger = logger;
    }

    public async Task<CustomerBillResponseModel> GetBillByQrTokenAsync(string qrToken, int? sessionId, CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        if (table.ActiveOrderId == null)
            throw new BusinessException("ยังไม่มีออเดอร์สำหรับโต๊ะนี้");

        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.OrderItems.Where(oi => oi.Status != EOrderItemStatus.Cancelled && oi.Status != EOrderItemStatus.Voided))
                .ThenInclude(oi => oi.OrderItemOptions)
            .Include(o => o.OrderBills)
                .ThenInclude(b => b.ClaimedBySession)
            .FirstOrDefaultAsync(o => o.OrderId == table.ActiveOrderId, ct)
            ?? throw new EntityNotFoundException("Order", table.ActiveOrderId.Value);

        var items = order.OrderItems
            .OrderBy(oi => oi.CategoryType)
            .ThenBy(oi => oi.OrderItemId)
            .Select(oi => new CustomerOrderItemModel
            {
                CategoryType = oi.CategoryType,
                MenuName = oi.MenuNameThai,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice,
                Note = oi.Note,
                Options = oi.OrderItemOptions
                    .Select(o => $"{o.OptionGroupName}: {o.OptionItemName}")
                    .ToList()
            })
            .ToList();

        var bills = order.OrderBills
            .Where(b => !b.DeleteFlag)
            .OrderBy(b => b.OrderBillId)
            .Select(b => new CustomerBillSummaryModel
            {
                OrderBillId = b.OrderBillId,
                BillNumber = b.BillNumber,
                Status = b.Status.ToString(),
                BillType = b.BillType.ToString(),
                SplitCount = b.SplitCount,
                SplitIndex = b.SplitIndex,
                SubTotal = b.SubTotal,
                ServiceChargeAmount = b.ServiceChargeAmount,
                VatAmount = b.VatAmount,
                TotalDiscountAmount = b.TotalDiscountAmount,
                GrandTotal = b.GrandTotal,
                ClaimedByNickname = b.ClaimedBySession?.Nickname,
                ClaimPaymentMethod = b.ClaimPaymentMethod,
                IsClaimedByMe = sessionId.HasValue && b.ClaimedBySessionId == sessionId.Value,
            })
            .ToList();

        return new CustomerBillResponseModel
        {
            TableName = table.TableName,
            OrderNumber = order.OrderNumber,
            Items = items,
            Bills = bills
        };
    }

    public async Task ClaimBillAsync(string qrToken, int orderBillId, int sessionId, ClaimBillRequestModel request, CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        var bill = await _unitOfWork.OrderBills.GetAll()
            .Include(b => b.Order)
                .ThenInclude(o => o.Table)
                    .ThenInclude(t => t.Zone)
            .FirstOrDefaultAsync(b => b.OrderBillId == orderBillId && b.Order.TableId == table.TableId, ct)
            ?? throw new EntityNotFoundException("OrderBill", orderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("บิลนี้ชำระเงินแล้ว");

        if (bill.ClaimedBySessionId.HasValue && bill.ClaimedBySessionId.Value != sessionId)
            throw new BusinessException("บิลนี้มีคนเลือกแล้ว");

        bill.ClaimedBySessionId = sessionId;
        bill.ClaimedAt = DateTimeHelper.BangkokNow();
        bill.ClaimPaymentMethod = request.PaymentMethod;
        _unitOfWork.OrderBills.Update(bill);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Session {SessionId} claimed Bill {BillId} with {Method}", sessionId, orderBillId, request.PaymentMethod);

        await _notificationService.NotifyBillClaimedAsync(table.TableId, orderBillId, ct);

        // ถ้าเลือกเงินสด → แจ้งพนักงาน
        if (request.PaymentMethod == "Cash")
        {
            var splitInfo = bill.SplitCount > 1 ? $" (บิลที่ {bill.SplitIndex}/{bill.SplitCount})" : "";
            await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "REQUEST_CASH_PAYMENT",
                Title = "ลูกค้าขอชำระเงินสด",
                Message = $"โซน{bill.Order.Table.Zone.ZoneName} - โต๊ะ{bill.Order.Table.TableName}{splitInfo}\nยอด {bill.GrandTotal:N2} บาท",
                TableId = table.TableId,
                OrderId = bill.Order.OrderId,
                TargetGroup = "Floor"
            }, ct);
        }
    }

    public async Task ReleaseBillAsync(string qrToken, int orderBillId, int sessionId, CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        var bill = await _unitOfWork.OrderBills.GetAll()
            .FirstOrDefaultAsync(b => b.OrderBillId == orderBillId && b.Order.TableId == table.TableId, ct)
            ?? throw new EntityNotFoundException("OrderBill", orderBillId);

        if (bill.ClaimedBySessionId != sessionId)
            throw new BusinessException("คุณไม่ได้เป็นผู้เลือกบิลนี้");

        bill.ClaimedBySessionId = null;
        bill.ClaimedAt = null;
        bill.ClaimPaymentMethod = null;
        _unitOfWork.OrderBills.Update(bill);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Session {SessionId} released Bill {BillId}", sessionId, orderBillId);

        await _notificationService.NotifyBillReleasedAsync(table.TableId, orderBillId, ct);
    }

    public async Task<SlipUploadResultModel> UploadSlipAsync(
        string qrToken,
        CustomerUploadSlipRequestModel request,
        IFormFile slipFile,
        CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        var bill = await _unitOfWork.OrderBills.GetAll()
            .Include(b => b.Order)
            .FirstOrDefaultAsync(b => b.OrderBillId == request.OrderBillId && b.Order.TableId == table.TableId, ct)
            ?? throw new EntityNotFoundException("OrderBill", request.OrderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("บิลนี้ชำระเงินแล้ว");

        var fileResult = await _fileService.UploadAsync(slipFile, ct);

        using var stream = slipFile.OpenReadStream();
        var ocrResult = await _slipOcrService.ExtractSlipDataAsync(stream, ct);
        var ocrAmount = ocrResult.Amount;

        var verificationStatus = ocrAmount.HasValue && ocrAmount.Value == bill.GrandTotal
            ? ESlipVerificationStatus.Matched
            : ocrAmount.HasValue
                ? ESlipVerificationStatus.Mismatched
                : ESlipVerificationStatus.None;

        // Date verification
        bool? isDateToday = ocrResult.TransferDate.HasValue
            ? ocrResult.TransferDate.Value.Date == DateTimeHelper.BangkokToday()
            : null;

        // Account verification (เช็คทั้งเลขบัญชีธนาคาร + PromptPay)
        bool? isAccountMatched = null;
        if (!string.IsNullOrEmpty(ocrResult.AccountNumber))
        {
            var shopSettings = await _unitOfWork.ShopSettings.GetAll()
                .AsNoTracking()
                .FirstOrDefaultAsync(ct);

            var ocrDigits = Regex.Replace(ocrResult.AccountNumber, @"[^0-9]", "");

            if (!string.IsNullOrEmpty(shopSettings?.AccountNumber))
            {
                var shopDigits = Regex.Replace(shopSettings.AccountNumber, @"[^0-9]", "");
                if (shopDigits.Contains(ocrDigits) || ocrDigits.Contains(shopDigits))
                    isAccountMatched = true;
            }

            if (isAccountMatched != true && !string.IsNullOrEmpty(shopSettings?.PromptPayNumber))
            {
                var promptPayDigits = Regex.Replace(shopSettings.PromptPayNumber, @"[^0-9]", "");
                if (promptPayDigits.Contains(ocrDigits) || ocrDigits.Contains(promptPayDigits))
                    isAccountMatched = true;
            }

            if (isAccountMatched == null && (!string.IsNullOrEmpty(shopSettings?.AccountNumber) || !string.IsNullOrEmpty(shopSettings?.PromptPayNumber)))
                isAccountMatched = false;
        }

        // Store slip info on bill so staff can see it
        bill.CustomerSlipFileId = fileResult.FileId;
        bill.CustomerSlipOcrAmount = ocrAmount;
        bill.CustomerSlipVerificationStatus = verificationStatus.ToString();
        bill.CustomerSlipOcrTransferDate = ocrResult.TransferDate;
        bill.CustomerSlipOcrAccountNumber = ocrResult.AccountNumber;
        bill.CustomerSlipIsAccountMatched = isAccountMatched;
        bill.CustomerSlipIsDateToday = isDateToday;
        _unitOfWork.OrderBills.Update(bill);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation(
            "Customer uploaded slip for Bill {BillId}: FileId={FileId}, OCR={OcrAmount}, Expected={GrandTotal}, Status={Status}",
            request.OrderBillId, fileResult.FileId, ocrAmount, bill.GrandTotal, verificationStatus);

        await _notificationService.NotifySlipUploadedAsync(table.TableId, request.OrderBillId, ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "SLIP_UPLOADED",
            Title = "ลูกค้าส่งสลิปมาแล้ว",
            Message = $"ออเดอร์ #{bill.Order.OrderNumber.Split('-').Last()} ส่งสลิปชำระเงิน\nยอดบิล {bill.GrandTotal:N2} บาท",
            TableId = table.TableId,
            OrderId = bill.Order.OrderId,
            TargetGroup = "Cashier"
        }, ct);

        return new SlipUploadResultModel
        {
            OrderBillId = request.OrderBillId,
            SlipImageFileId = fileResult.FileId,
            OcrAmount = ocrAmount,
            VerificationStatus = verificationStatus.ToString(),
            BillGrandTotal = bill.GrandTotal,
            OcrTransferDate = ocrResult.TransferDate,
            OcrAccountNumber = ocrResult.AccountNumber,
            IsAccountMatched = isAccountMatched,
            IsDateToday = isDateToday
        };
    }

    public async Task<string> GetPaymentStatusAsync(string qrToken, int orderBillId, CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        var bill = await _unitOfWork.OrderBills.QueryNoTracking()
            .FirstOrDefaultAsync(b => b.OrderBillId == orderBillId && b.Order.TableId == table.TableId, ct)
            ?? throw new EntityNotFoundException("OrderBill", orderBillId);

        return bill.Status.ToString();
    }

    private async Task<TbTable> ValidateQrTokenAsync(string qrToken, CancellationToken ct)
    {
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .FirstOrDefaultAsync(t => t.QrToken == qrToken, ct)
            ?? throw new BusinessException("QR Token ไม่ถูกต้องหรือหมดอายุ");

        if (table.QrTokenExpiresAt.HasValue && table.QrTokenExpiresAt.Value < DateTimeHelper.BangkokNow())
            throw new BusinessException("QR Token หมดอายุแล้ว กรุณาสแกน QR ใหม่");

        return table;
    }
}
