using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Customer;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Payment.Services;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileService _fileService;
    private readonly ISlipOcrService _slipOcrService;
    private readonly IOrderNotificationService _notificationService;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(
        IUnitOfWork unitOfWork,
        IFileService fileService,
        ISlipOcrService slipOcrService,
        IOrderNotificationService notificationService,
        ILogger<CustomerService> logger)
    {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
        _slipOcrService = slipOcrService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<CustomerBillResponseModel> GetBillByQrTokenAsync(string qrToken, CancellationToken ct = default)
    {
        var table = await ValidateQrTokenAsync(qrToken, ct);

        if (table.ActiveOrderId == null)
            throw new BusinessException("ยังไม่มีออเดอร์สำหรับโต๊ะนี้");

        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.OrderItems.Where(oi => oi.Status != EOrderItemStatus.Cancelled && oi.Status != EOrderItemStatus.Voided))
                .ThenInclude(oi => oi.OrderItemOptions)
            .Include(o => o.OrderBills)
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
                SubTotal = b.SubTotal,
                ServiceChargeAmount = b.ServiceChargeAmount,
                VatAmount = b.VatAmount,
                TotalDiscountAmount = b.TotalDiscountAmount,
                GrandTotal = b.GrandTotal,
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

        decimal? ocrAmount = null;
        using var stream = slipFile.OpenReadStream();
        ocrAmount = await _slipOcrService.ExtractAmountAsync(stream, ct);

        var verificationStatus = ocrAmount.HasValue && ocrAmount.Value == bill.GrandTotal
            ? ESlipVerificationStatus.Matched
            : ocrAmount.HasValue
                ? ESlipVerificationStatus.Mismatched
                : ESlipVerificationStatus.None;

        _logger.LogInformation(
            "Customer uploaded slip for Bill {BillId}: OCR={OcrAmount}, Expected={GrandTotal}, Status={Status}",
            request.OrderBillId, ocrAmount, bill.GrandTotal, verificationStatus);

        await _notificationService.NotifySlipUploadedAsync(table.TableId, request.OrderBillId, ct);

        return new SlipUploadResultModel
        {
            OrderBillId = request.OrderBillId,
            SlipImageFileId = fileResult.FileId,
            OcrAmount = ocrAmount,
            VerificationStatus = verificationStatus.ToString(),
            BillGrandTotal = bill.GrandTotal
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

        if (table.QrTokenExpiresAt.HasValue && table.QrTokenExpiresAt.Value < DateTime.UtcNow)
            throw new BusinessException("QR Token หมดอายุแล้ว กรุณาสแกน QR ใหม่");

        return table;
    }
}
