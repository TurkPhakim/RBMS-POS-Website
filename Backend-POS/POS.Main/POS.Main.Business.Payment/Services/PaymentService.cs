using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Models.Payment;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Helpers;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Payment.Services;

public class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrderNotificationService _notificationService;
    private readonly INotificationBroadcaster _notificationBroadcaster;
    private readonly IFileService _fileService;
    private readonly ISlipOcrService _slipOcrService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IUnitOfWork unitOfWork,
        IOrderNotificationService notificationService,
        INotificationBroadcaster notificationBroadcaster,
        IFileService fileService,
        ISlipOcrService slipOcrService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<PaymentService> logger)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _notificationBroadcaster = notificationBroadcaster;
        _fileService = fileService;
        _slipOcrService = slipOcrService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<PaymentResponseModel> PayCashAsync(CashPaymentRequestModel request, CancellationToken ct = default)
    {
        // 1. Validate cashier session is open
        var userId = GetCurrentUserId();
        var session = await _unitOfWork.CashierSessions.GetAll()
            .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.Status == ECashierSessionStatus.Open, ct)
            ?? throw new BusinessException("กรุณาเปิดกะแคชเชียร์ก่อนรับชำระเงิน");

        // 2. Validate bill exists and is pending
        var bill = await _unitOfWork.OrderBills.GetAll()
            .Include(b => b.Order)
                .ThenInclude(o => o.Table)
            .FirstOrDefaultAsync(b => b.OrderBillId == request.OrderBillId, ct)
            ?? throw new EntityNotFoundException("OrderBill", request.OrderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("บิลนี้ชำระเงินไปแล้ว");

        // 3. Validate amount received
        if (request.AmountReceived < bill.GrandTotal)
            throw new ValidationException("จำนวนเงินที่รับน้อยกว่ายอดบิล");

        // 4. Create payment
        await using var transaction = await _unitOfWork.BeginTransactionAsync(ct);
        try
        {
            var payment = new TbPayment
            {
                OrderBillId = bill.OrderBillId,
                CashierSessionId = session.CashierSessionId,
                PaymentMethod = EPaymentMethod.Cash,
                AmountDue = bill.GrandTotal,
                AmountReceived = request.AmountReceived,
                ChangeAmount = request.AmountReceived - bill.GrandTotal,
                SlipVerificationStatus = ESlipVerificationStatus.None,
                PaidAt = DateTimeHelper.BangkokNow(),
                Note = request.Note,
            };

            await _unitOfWork.Payments.AddAsync(payment, ct);

            // 5. Update bill status
            bill.Status = EBillStatus.Paid;
            bill.PaidAt = DateTimeHelper.BangkokNow();
            _unitOfWork.OrderBills.Update(bill);

            // 6. Update cashier session totals
            session.TotalCashSales += bill.GrandTotal;
            session.BillCount += 1;
            _unitOfWork.CashierSessions.Update(session);

            await _unitOfWork.CommitAsync(ct);

            // 7. Check if all bills of the order are paid → complete order
            await CompleteOrderIfAllBillsPaidAsync(bill, ct);

            await transaction.CommitAsync(ct);

            _logger.LogInformation("Cash payment {PaymentId} created for Bill {OrderBillId}, Amount: {Amount}",
                payment.PaymentId, bill.OrderBillId, bill.GrandTotal);

            // Load full navigation for response
            var result = await _unitOfWork.Payments.QueryNoTracking()
                .Include(p => p.OrderBill)
                    .ThenInclude(b => b.Order)
                        .ThenInclude(o => o.Table)
                .FirstAsync(p => p.PaymentId == payment.PaymentId, ct);

            return PaymentMapper.ToResponse(result);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<SlipUploadResultModel> UploadSlipAsync(UploadSlipRequestModel request, IFormFile slipFile, CancellationToken ct = default)
    {
        // 1. Validate bill exists and is pending
        var bill = await _unitOfWork.OrderBills.GetAll()
            .FirstOrDefaultAsync(b => b.OrderBillId == request.OrderBillId, ct)
            ?? throw new EntityNotFoundException("OrderBill", request.OrderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("บิลนี้ชำระเงินไปแล้ว");

        // 2. Upload slip image
        var fileResult = await _fileService.UploadAsync(slipFile, ct);

        // 3. OCR extract data (amount, date, account)
        using var stream = slipFile.OpenReadStream();
        var ocrResult = await _slipOcrService.ExtractSlipDataAsync(stream, ct);

        // 4. Determine amount verification status
        var verificationStatus = ESlipVerificationStatus.None;
        if (ocrResult.Amount.HasValue)
        {
            verificationStatus = ocrResult.Amount.Value == bill.GrandTotal
                ? ESlipVerificationStatus.Matched
                : ESlipVerificationStatus.Mismatched;
        }

        // 5. Determine date verification
        bool? isDateToday = ocrResult.TransferDate.HasValue
            ? ocrResult.TransferDate.Value.Date == DateTime.Today
            : null;

        // 6. Determine account verification
        bool? isAccountMatched = null;
        string? shopAccountNumber = null;
        if (!string.IsNullOrEmpty(ocrResult.AccountNumber))
        {
            var shopSettings = await _unitOfWork.ShopSettings.GetAll()
                .AsNoTracking()
                .FirstOrDefaultAsync(ct);

            shopAccountNumber = shopSettings?.AccountNumber;

            if (!string.IsNullOrEmpty(shopAccountNumber))
            {
                // normalize: ลบ - และช่องว่าง แล้วเทียบ
                var ocrDigits = System.Text.RegularExpressions.Regex.Replace(ocrResult.AccountNumber, @"[^0-9]", "");
                var shopDigits = System.Text.RegularExpressions.Regex.Replace(shopAccountNumber, @"[^0-9]", "");
                isAccountMatched = shopDigits.Contains(ocrDigits) || ocrDigits.Contains(shopDigits);
            }
        }

        _logger.LogInformation("Slip uploaded for Bill {OrderBillId}, FileId: {FileId}, OCR Amount: {OcrAmount}, Date: {Date}, Account: {Account}, Status: {Status}",
            request.OrderBillId, fileResult.FileId, ocrResult.Amount, ocrResult.TransferDate, ocrResult.AccountNumber, verificationStatus);

        return new SlipUploadResultModel
        {
            OrderBillId = bill.OrderBillId,
            SlipImageFileId = fileResult.FileId,
            OcrAmount = ocrResult.Amount,
            VerificationStatus = verificationStatus.ToString(),
            BillGrandTotal = bill.GrandTotal,
            OcrTransferDate = ocrResult.TransferDate,
            IsDateToday = isDateToday,
            OcrAccountNumber = ocrResult.AccountNumber,
            ShopAccountNumber = shopAccountNumber,
            IsAccountMatched = isAccountMatched,
        };
    }

    public async Task<PaymentResponseModel> ConfirmQrPaymentAsync(ConfirmQrPaymentRequestModel request, CancellationToken ct = default)
    {
        // 1. Validate cashier session is open
        var userId = GetCurrentUserId();
        var session = await _unitOfWork.CashierSessions.GetAll()
            .FirstOrDefaultAsync(cs => cs.UserId == userId && cs.Status == ECashierSessionStatus.Open, ct)
            ?? throw new BusinessException("กรุณาเปิดกะแคชเชียร์ก่อนรับชำระเงิน");

        // 2. Validate bill exists and is pending
        var bill = await _unitOfWork.OrderBills.GetAll()
            .Include(b => b.Order)
                .ThenInclude(o => o.Table)
            .FirstOrDefaultAsync(b => b.OrderBillId == request.OrderBillId, ct)
            ?? throw new EntityNotFoundException("OrderBill", request.OrderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("บิลนี้ชำระเงินไปแล้ว");

        // 3. Validate manual amount
        if (request.ManualAmount.HasValue && request.ManualAmount.Value < bill.GrandTotal)
            throw new ValidationException("จำนวนเงินที่รับน้อยกว่ายอดบิล");

        // 4. Create payment
        await using var transaction = await _unitOfWork.BeginTransactionAsync(ct);
        try
        {
            // Use customer-uploaded slip from bill if staff didn't upload
            var slipFileId = request.SlipImageFileId ?? bill.CustomerSlipFileId;
            var ocrAmount = request.OcrAmount ?? bill.CustomerSlipOcrAmount;

            var amountReceived = request.ManualAmount ?? bill.GrandTotal;

            ESlipVerificationStatus verificationStatus;
            if (request.ManualAmount.HasValue)
                verificationStatus = ESlipVerificationStatus.Manual;
            else if (slipFileId.HasValue)
                verificationStatus = ESlipVerificationStatus.Matched;
            else
                verificationStatus = ESlipVerificationStatus.None;

            var payment = new TbPayment
            {
                OrderBillId = bill.OrderBillId,
                CashierSessionId = session.CashierSessionId,
                PaymentMethod = EPaymentMethod.QrPayment,
                AmountDue = bill.GrandTotal,
                AmountReceived = amountReceived,
                ChangeAmount = 0,
                SlipImageFileId = slipFileId,
                SlipOcrAmount = ocrAmount,
                SlipVerificationStatus = verificationStatus,
                PaymentReference = request.PaymentReference,
                PaidAt = DateTimeHelper.BangkokNow(),
                Note = request.Note,
            };

            await _unitOfWork.Payments.AddAsync(payment, ct);

            // 4. Update bill status
            bill.Status = EBillStatus.Paid;
            bill.PaidAt = DateTimeHelper.BangkokNow();
            _unitOfWork.OrderBills.Update(bill);

            // 5. Update cashier session totals
            session.TotalQrSales += bill.GrandTotal;
            session.BillCount += 1;
            _unitOfWork.CashierSessions.Update(session);

            await _unitOfWork.CommitAsync(ct);

            // 6. Check if all bills of the order are paid
            await CompleteOrderIfAllBillsPaidAsync(bill, ct);

            await transaction.CommitAsync(ct);

            _logger.LogInformation("QR payment {PaymentId} created for Bill {OrderBillId}, Amount: {Amount}",
                payment.PaymentId, bill.OrderBillId, bill.GrandTotal);

            // Load full navigation for response
            var result = await _unitOfWork.Payments.QueryNoTracking()
                .Include(p => p.OrderBill)
                    .ThenInclude(b => b.Order)
                        .ThenInclude(o => o.Table)
                .FirstAsync(p => p.PaymentId == payment.PaymentId, ct);

            return PaymentMapper.ToResponse(result);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<List<PaymentResponseModel>> GetPaymentsByOrderAsync(int orderId, CancellationToken ct = default)
    {
        var payments = await _unitOfWork.Payments.QueryNoTracking()
            .Include(p => p.OrderBill)
                .ThenInclude(b => b.Order)
                    .ThenInclude(o => o.Table)
            .Where(p => p.OrderBill.OrderId == orderId)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync(ct);

        return payments.Select(PaymentMapper.ToResponse).ToList();
    }

    public async Task<PaymentResponseModel> GetPaymentByIdAsync(int paymentId, CancellationToken ct = default)
    {
        var payment = await _unitOfWork.Payments.QueryNoTracking()
            .Include(p => p.OrderBill)
                .ThenInclude(b => b.Order)
                    .ThenInclude(o => o.Table)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId, ct)
            ?? throw new EntityNotFoundException("Payment", paymentId);

        return PaymentMapper.ToResponse(payment);
    }

    public async Task<PaginationResult<PaymentResponseModel>> GetPaymentHistoryAsync(PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Payments.QueryNoTracking()
            .Include(p => p.OrderBill)
                .ThenInclude(b => b.Order)
                    .ThenInclude(o => o.Table)
            .OrderByDescending(p => p.PaidAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var search = param.Search.Trim().ToLower();
            query = query.Where(p =>
                (p.OrderBill.BillNumber != null && p.OrderBill.BillNumber.ToLower().Contains(search)) ||
                (p.OrderBill.Order.OrderNumber != null && p.OrderBill.Order.OrderNumber.ToLower().Contains(search)) ||
                (p.OrderBill.Order.Table != null && p.OrderBill.Order.Table.TableName.ToLower().Contains(search)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((param.Page - 1) * param.ItemPerPage)
            .Take(param.ItemPerPage)
            .ToListAsync(ct);

        return new PaginationResult<PaymentResponseModel>
        {
            Page = param.Page,
            ItemPerPage = param.ItemPerPage,
            Total = total,
            Results = items.Select(PaymentMapper.ToResponse).ToList(),
        };
    }

    public async Task<ReceiptDataModel> GetReceiptDataAsync(int paymentId, CancellationToken ct = default)
    {
        var payment = await _unitOfWork.Payments.QueryNoTracking()
            .Include(p => p.CashierSession)
                .ThenInclude(cs => cs.User)
                    .ThenInclude(u => u.Employee)
            .Include(p => p.OrderBill)
                .ThenInclude(b => b.Order)
                    .ThenInclude(o => o.Table)
                        .ThenInclude(t => t.Zone)
            .Include(p => p.OrderBill)
                .ThenInclude(b => b.Order)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.OrderItemOptions)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId, ct)
            ?? throw new EntityNotFoundException("Payment", paymentId);

        var shop = await _unitOfWork.ShopSettings.QueryNoTracking()
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessException("ไม่พบข้อมูลร้านค้า");

        var bill = payment.OrderBill;
        var order = bill.Order;
        var cashierEmployee = payment.CashierSession?.User?.Employee;

        // Filter items based on BillType
        var receiptItems = new List<ReceiptItemModel>();
        if (bill.BillType == EBillType.ByItem)
        {
            // ByItem: show only items linked to this bill
            receiptItems = order.OrderItems
                .Where(oi => oi.Status != EOrderItemStatus.Cancelled && oi.OrderBillId == bill.OrderBillId)
                .Select(oi => MapToReceiptItem(oi))
                .ToList();
        }
        else if (bill.BillType == EBillType.ByAmount)
        {
            // ByAmount: show all items (split info displayed separately on receipt)
            receiptItems = order.OrderItems
                .Where(oi => oi.Status != EOrderItemStatus.Cancelled)
                .Select(oi => MapToReceiptItem(oi))
                .ToList();
        }
        else
        {
            // Full: show all items
            receiptItems = order.OrderItems
                .Where(oi => oi.Status != EOrderItemStatus.Cancelled)
                .Select(oi => MapToReceiptItem(oi))
                .ToList();
        }

        return new ReceiptDataModel
        {
            ShopNameThai = shop.ShopNameThai,
            ShopNameEnglish = shop.ShopNameEnglish,
            Address = shop.Address,
            PhoneNumber = shop.PhoneNumber,
            TaxId = shop.TaxId,
            ReceiptHeaderText = shop.ReceiptHeaderText,
            ReceiptFooterText = shop.ReceiptFooterText,
            ShopEmail = shop.ShopEmail,
            Facebook = shop.Facebook,
            Instagram = shop.Instagram,
            Website = shop.Website,
            LineId = shop.LineId,
            PaymentId = payment.PaymentId,
            PaymentMethod = payment.PaymentMethod.ToString(),
            PaidAt = payment.PaidAt,
            BillNumber = bill.BillNumber,
            BillType = bill.BillType.ToString(),
            SplitCount = bill.SplitCount,
            SplitIndex = bill.SplitIndex,
            OrderNumber = order.OrderNumber,
            TableName = order.Table?.TableName,
            ZoneName = order.Table?.Zone?.ZoneName,
            GuestCount = order.GuestCount,
            CompanyNameThai = shop.CompanyNameThai,
            CompanyNameEnglish = shop.CompanyNameEnglish,
            SubTotal = bill.SubTotal,
            OriginalSubTotal = bill.BillType == EBillType.ByAmount
                ? order.OrderItems
                    .Where(i => i.Status != EOrderItemStatus.Cancelled)
                    .Sum(i => i.TotalPrice)
                : bill.SubTotal,
            ServiceChargeRate = bill.ServiceChargeRate,
            ServiceChargeAmount = bill.ServiceChargeAmount,
            VatRate = bill.VatRate,
            VatAmount = bill.VatAmount,
            TotalDiscountAmount = bill.TotalDiscountAmount,
            GrandTotal = bill.GrandTotal,
            AmountReceived = payment.AmountReceived,
            ChangeAmount = payment.ChangeAmount,
            CashierName = cashierEmployee != null
                ? $"{cashierEmployee.FirstNameThai} {cashierEmployee.LastNameThai}"
                : null,
            Items = receiptItems,
        };
    }

    public async Task<ReceiptDataModel> GetConsolidatedReceiptDataAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.Table)
                .ThenInclude(t => t.Zone)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.OrderItemOptions)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        var bills = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.OrderId == orderId && b.Status == EBillStatus.Paid)
            .ToListAsync(ct);

        if (bills.Count == 0)
            throw new BusinessException("ยังไม่มีบิลที่ชำระเงินแล้ว");

        var billIds = bills.Select(b => b.OrderBillId).ToList();
        var payments = await _unitOfWork.Payments.QueryNoTracking()
            .Include(p => p.CashierSession)
                .ThenInclude(cs => cs.User)
                    .ThenInclude(u => u.Employee)
            .Where(p => billIds.Contains(p.OrderBillId))
            .ToListAsync(ct);

        var shop = await _unitOfWork.ShopSettings.QueryNoTracking()
            .FirstOrDefaultAsync(ct)
            ?? throw new BusinessException("ไม่พบข้อมูลร้านค้า");

        return new ReceiptDataModel
        {
            ShopNameThai = shop.ShopNameThai,
            ShopNameEnglish = shop.ShopNameEnglish,
            Address = shop.Address,
            PhoneNumber = shop.PhoneNumber,
            TaxId = shop.TaxId,
            ReceiptHeaderText = shop.ReceiptHeaderText,
            ReceiptFooterText = shop.ReceiptFooterText,
            ShopEmail = shop.ShopEmail,
            Facebook = shop.Facebook,
            Instagram = shop.Instagram,
            Website = shop.Website,
            LineId = shop.LineId,
            BillNumber = $"รวม-{order.OrderNumber}",
            BillType = "Consolidated",
            OrderNumber = order.OrderNumber,
            TableName = order.Table?.TableName,
            ZoneName = order.Table?.Zone?.ZoneName,
            GuestCount = order.GuestCount,
            PaidAt = payments.Max(p => p.PaidAt),
            CashierName = payments.OrderByDescending(p => p.PaidAt).First().CashierSession?.User?.Employee is { } emp
                ? $"{emp.FirstNameThai} {emp.LastNameThai}"
                : null,
            CompanyNameThai = shop.CompanyNameThai,
            CompanyNameEnglish = shop.CompanyNameEnglish,
            SplitCount = bills.Count,
            SubTotal = bills.Sum(b => b.SubTotal),
            ServiceChargeRate = bills.FirstOrDefault()?.ServiceChargeRate ?? 0,
            ServiceChargeAmount = bills.Sum(b => b.ServiceChargeAmount),
            VatRate = bills.FirstOrDefault()?.VatRate ?? 0,
            VatAmount = bills.Sum(b => b.VatAmount),
            TotalDiscountAmount = bills.Sum(b => b.TotalDiscountAmount),
            GrandTotal = bills.Sum(b => b.GrandTotal),
            IsConsolidated = true,
            Items = order.OrderItems
                .Where(oi => oi.Status != EOrderItemStatus.Cancelled)
                .Select(oi => MapToReceiptItem(oi))
                .ToList(),
            Payments = payments.Select(p =>
            {
                var bill = bills.First(b => b.OrderBillId == p.OrderBillId);
                return new ConsolidatedPaymentInfo
                {
                    BillNumber = bill.BillNumber,
                    PaymentMethod = p.PaymentMethod.ToString(),
                    AmountPaid = bill.GrandTotal,
                    PaidAt = p.PaidAt,
                };
            }).ToList(),
        };
    }

    private static ReceiptItemModel MapToReceiptItem(TbOrderItem oi)
    {
        return new ReceiptItemModel
        {
            MenuName = oi.MenuNameThai,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            TotalPrice = oi.TotalPrice,
            Note = oi.Note,
            Options = oi.OrderItemOptions
                .Select(o => o.AdditionalPrice != 0
                    ? $"{o.OptionGroupName}: {o.OptionItemName} ({o.AdditionalPrice:F2})"
                    : $"{o.OptionGroupName}: {o.OptionItemName}")
                .ToList(),
        };
    }

    private async Task CompleteOrderIfAllBillsPaidAsync(TbOrderBill bill, CancellationToken ct)
    {
        var order = bill.Order;
        var allBillsPaid = !await _unitOfWork.OrderBills.GetAll()
            .AnyAsync(b => b.OrderId == order.OrderId && b.Status == EBillStatus.Pending, ct);

        if (allBillsPaid)
        {
            order.Status = EOrderStatus.Completed;
            _unitOfWork.Orders.Update(order);

            var table = order.Table;

            // Find linked tables before clearing
            var link = await _unitOfWork.TableLinks.QueryNoTracking()
                .FirstOrDefaultAsync(tl => tl.TableId == table.TableId, ct);

            var linkedTableIds = new List<int>();
            if (link != null)
            {
                var allLinks = await _unitOfWork.TableLinks.GetAll()
                    .Where(tl => tl.GroupCode == link.GroupCode)
                    .ToListAsync(ct);
                linkedTableIds = allLinks.Select(tl => tl.TableId).ToList();

                // Close all linked tables
                foreach (var ltId in linkedTableIds.Where(id => id != table.TableId))
                {
                    var lt = await _unitOfWork.Tables.GetByIdAsync(ltId, ct);
                    if (lt != null)
                    {
                        lt.Status = ETableStatus.Cleaning;
                        lt.ActiveOrderId = null;
                        lt.CurrentGuests = 0;
                        lt.GuestType = null;
                        lt.Note = null;
                        _unitOfWork.Tables.Update(lt);
                    }
                }

                // Auto-unlink
                _unitOfWork.TableLinks.DeleteRange(allLinks);
            }

            // Close primary table
            table.Status = ETableStatus.Cleaning;
            table.ActiveOrderId = null;
            table.CurrentGuests = 0;
            table.GuestType = null;
            table.Note = null;
            _unitOfWork.Tables.Update(table);

            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Order {OrderId} completed, Table {TableId} → Cleaning", order.OrderId, table.TableId);

            await _notificationService.NotifyOrderUpdatedAsync(order.OrderId, "Completed", ct);
            await _notificationService.NotifyTableStatusChangedAsync(table.TableId, "Cleaning", ct);

            foreach (var ltId in linkedTableIds.Where(id => id != table.TableId))
                await _notificationService.NotifyTableStatusChangedAsync(ltId, "Cleaning", ct);
        }

        await _notificationService.NotifyPaymentCompletedAsync(bill.Order.TableId, bill.OrderBillId, ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "PAYMENT_COMPLETED",
            Title = "ชำระเงินสำเร็จ",
            Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} ชำระเงินเรียบร้อย\nจำนวนเงิน {bill.GrandTotal:N2} บาท",
            TableId = order.TableId,
            OrderId = order.OrderId,
            TargetGroup = "Floor"
        }, ct);
    }

    private Guid GetCurrentUserId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;

        return Guid.TryParse(claim, out var userId) ? userId : throw new AuthenticationException("ไม่พบข้อมูลผู้ใช้งาน");
    }
}
