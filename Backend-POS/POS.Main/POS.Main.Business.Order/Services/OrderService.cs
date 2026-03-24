using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Order.Models.Order;
using POS.Main.Business.Order.Models.OrderBill;
using POS.Main.Business.Order.Models.OrderItem;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Order.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrderService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOrderNotificationService _notificationService;
    private readonly INotificationBroadcaster _notificationBroadcaster;

    public OrderService(IUnitOfWork unitOfWork, ILogger<OrderService> logger,
        IHttpContextAccessor httpContextAccessor, IOrderNotificationService notificationService,
        INotificationBroadcaster notificationBroadcaster)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
        _notificationBroadcaster = notificationBroadcaster;
    }

    public async Task<PaginationResult<OrderResponseModel>> GetOrdersAsync(
        DateTime? dateFrom, DateTime? dateTo, string? status, int? zoneId, int? tableId,
        PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.Table)
                .ThenInclude(t => t.Zone)
            .Include(o => o.OrderItems)
            .AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(o => o.CreatedAt >= dateFrom.Value.Date);

        if (dateTo.HasValue)
            query = query.Where(o => o.CreatedAt < dateTo.Value.Date.AddDays(1));

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<EOrderStatus>(status, true, out var statusEnum))
            query = query.Where(o => o.Status == statusEnum);

        if (zoneId.HasValue)
            query = query.Where(o => o.Table.ZoneId == zoneId.Value);

        if (tableId.HasValue)
            query = query.Where(o => o.TableId == tableId.Value);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(term)
                || o.Table.TableName.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<OrderResponseModel>
        {
            Results = items.Select(OrderMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<OrderDetailResponseModel> GetOrderByIdAsync(int orderId, CancellationToken ct = default)
    {
        var order = await GetOrderWithDetailsAsync(orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        return OrderMapper.ToDetailResponse(order);
    }

    public async Task<OrderDetailResponseModel> CreateOrderAsync(CreateOrderRequestModel request, CancellationToken ct = default)
    {
        var table = await _unitOfWork.Tables.GetByIdAsync(request.TableId, ct)
            ?? throw new EntityNotFoundException("Table", request.TableId);

        if (table.Status != ETableStatus.Occupied)
            throw new BusinessException("โต๊ะต้องอยู่ในสถานะ Occupied ก่อนสร้างออเดอร์");

        if (table.ActiveOrderId.HasValue)
            throw new BusinessException("โต๊ะนี้มีออเดอร์ที่เปิดอยู่แล้ว");

        var order = new TbOrder
        {
            TableId = request.TableId,
            OrderNumber = await GenerateOrderNumberAsync(ct),
            Status = EOrderStatus.Open,
            GuestCount = request.GuestCount,
            SubTotal = 0,
            Note = request.Note
        };

        await _unitOfWork.Orders.AddAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        // Link order to table
        table.ActiveOrderId = order.OrderId;
        _unitOfWork.Tables.Update(table);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created Order {OrderNumber} for Table {TableId}", order.OrderNumber, request.TableId);

        return await GetOrderByIdAsync(order.OrderId, ct);
    }

    public async Task<OrderDetailResponseModel?> GetActiveOrderByTableIdAsync(int tableId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.OrderItemOptions)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.CancelledByEmployee)
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == EOrderStatus.Open, ct);

        return order != null ? OrderMapper.ToDetailResponse(order) : null;
    }

    public async Task<OrderDetailResponseModel> AddOrderItemsAsync(int orderId, AddOrderItemsRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.Table)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถเพิ่มรายการได้ — ออเดอร์ไม่ได้อยู่ในสถานะเปิด");

        var orderedByName = await GetCurrentEmployeeNameAsync(ct);

        foreach (var itemReq in request.Items)
        {
            var menu = await _unitOfWork.Menus.QueryNoTracking()
                .Include(m => m.SubCategory)
                .FirstOrDefaultAsync(m => m.MenuId == itemReq.MenuId, ct)
                ?? throw new EntityNotFoundException("Menu", itemReq.MenuId);

            if (!menu.IsAvailable)
                throw new BusinessException($"เมนู \"{menu.NameThai}\" ไม่พร้อมจำหน่าย");

            var orderItem = new TbOrderItem
            {
                OrderId = orderId,
                MenuId = menu.MenuId,
                MenuNameThai = menu.NameThai,
                MenuNameEnglish = menu.NameEnglish,
                CategoryType = menu.SubCategory.CategoryType,
                Quantity = itemReq.Quantity,
                UnitPrice = menu.Price,
                CostPrice = menu.CostPrice,
                Note = itemReq.Note,
                OrderedBy = orderedByName,
                Status = EOrderItemStatus.Pending
            };

            decimal optionsTotal = 0;

            foreach (var optReq in itemReq.Options)
            {
                var optionGroup = await _unitOfWork.OptionGroups.QueryNoTracking()
                    .FirstOrDefaultAsync(og => og.OptionGroupId == optReq.OptionGroupId, ct)
                    ?? throw new EntityNotFoundException("OptionGroup", optReq.OptionGroupId);

                var optItem = await _unitOfWork.OptionGroups.QueryNoTracking()
                    .SelectMany(og => og.OptionItems)
                    .FirstOrDefaultAsync(oi => oi.OptionItemId == optReq.OptionItemId && oi.OptionGroupId == optReq.OptionGroupId, ct)
                    ?? throw new EntityNotFoundException("OptionItem", optReq.OptionItemId);

                orderItem.OrderItemOptions.Add(new TbOrderItemOption
                {
                    OptionGroupId = optReq.OptionGroupId,
                    OptionItemId = optReq.OptionItemId,
                    OptionGroupName = optionGroup.Name,
                    OptionItemName = optItem.Name,
                    AdditionalPrice = optItem.AdditionalPrice
                });

                optionsTotal += optItem.AdditionalPrice;
            }

            orderItem.OptionsTotalPrice = optionsTotal;
            orderItem.TotalPrice = (menu.Price + optionsTotal) * itemReq.Quantity;

            await _unitOfWork.OrderItems.AddAsync(orderItem, ct);
        }

        await _unitOfWork.CommitAsync(ct);

        await RecalculateSubTotalAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Added {Count} items to Order {OrderId}", request.Items.Count, orderId);

        return await GetOrderByIdAsync(orderId, ct);
    }

    public async Task<OrderDetailResponseModel> SendToKitchenAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถส่งครัวได้ — ออเดอร์ไม่ได้อยู่ในสถานะเปิด");

        var pendingItems = order.OrderItems.Where(i => i.Status == EOrderItemStatus.Pending).ToList();
        if (pendingItems.Count == 0)
            throw new BusinessException("ไม่มีรายการที่รอส่งครัว");

        var now = DateTime.UtcNow;
        foreach (var item in pendingItems)
        {
            item.Status = EOrderItemStatus.Sent;
            item.SentToKitchenAt = now;
        }

        _unitOfWork.OrderItems.UpdateRange(pendingItems);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Sent {Count} items to kitchen for Order {OrderId}", pendingItems.Count, orderId);

        await _notificationService.NotifyNewOrderItemsAsync(orderId, order.TableId, ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "NEW_ORDER",
            Title = "ออเดอร์ใหม่ส่งครัว",
            Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} — {pendingItems.Count} รายการ",
            TableId = order.TableId,
            OrderId = orderId,
            TargetGroup = "Kitchen"
        }, ct);

        return await GetOrderByIdAsync(orderId, ct);
    }

    public async Task VoidOrderItemAsync(int orderItemId, CancellationToken ct = default)
    {
        var item = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.OrderItemId == orderItemId, ct)
            ?? throw new EntityNotFoundException("OrderItem", orderItemId);

        if (item.Status != EOrderItemStatus.Pending)
            throw new BusinessException("สามารถ Void ได้เฉพาะรายการที่ยังไม่ส่งครัว (สถานะ Pending เท่านั้น)");

        item.Status = EOrderItemStatus.Voided;
        _unitOfWork.OrderItems.Update(item);

        // Delete options (hard delete)
        var options = await _unitOfWork.OrderItemOptions.GetAll()
            .Where(o => o.OrderItemId == orderItemId)
            .ToListAsync(ct);
        _unitOfWork.OrderItemOptions.DeleteRange(options);

        await _unitOfWork.CommitAsync(ct);

        // Recalculate subtotal after commit so DB has latest status
        var order = item.Order;
        await RecalculateSubTotalAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Voided OrderItem {OrderItemId} from Order {OrderId}", orderItemId, order.OrderId);

        await _notificationService.NotifyItemCancelledAsync(order.OrderId, orderItemId, ct);
        await _notificationService.NotifyTableOrderRefreshAsync(order.TableId, ct);
    }

    public async Task CancelOrderItemAsync(int orderItemId, CancelOrderItemRequestModel request, CancellationToken ct = default)
    {
        var item = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.OrderItemId == orderItemId, ct)
            ?? throw new EntityNotFoundException("OrderItem", orderItemId);

        if (item.Status != EOrderItemStatus.Sent && item.Status != EOrderItemStatus.Preparing)
            throw new BusinessException("สามารถยกเลิกได้เฉพาะรายการที่ส่งครัวแล้ว (สถานะ Sent หรือ Preparing เท่านั้น)");

        var employeeId = GetCurrentEmployeeId();
        item.Status = EOrderItemStatus.Cancelled;
        item.CancelledBy = employeeId;
        item.CancelReason = request.CancelReason;
        _unitOfWork.OrderItems.Update(item);

        // Delete options (hard delete)
        var options = await _unitOfWork.OrderItemOptions.GetAll()
            .Where(o => o.OrderItemId == orderItemId)
            .ToListAsync(ct);
        _unitOfWork.OrderItemOptions.DeleteRange(options);

        await _unitOfWork.CommitAsync(ct);

        // Recalculate subtotal after commit so DB has latest status
        var order = item.Order;
        await RecalculateSubTotalAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cancelled OrderItem {OrderItemId} from Order {OrderId}, Reason: {Reason}",
            orderItemId, order.OrderId, request.CancelReason);

        await _notificationService.NotifyItemCancelledAsync(order.OrderId, orderItemId, ct);
        await _notificationService.NotifyTableOrderRefreshAsync(order.TableId, ct);
    }

    public async Task ServeOrderItemAsync(int orderItemId, CancellationToken ct = default)
    {
        var item = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.OrderItemId == orderItemId, ct)
            ?? throw new EntityNotFoundException("OrderItem", orderItemId);

        if (item.Status != EOrderItemStatus.Ready)
            throw new BusinessException("สามารถเสิร์ฟได้เฉพาะรายการที่พร้อมเสิร์ฟ (สถานะ Ready เท่านั้น)");

        item.Status = EOrderItemStatus.Served;
        item.ServedAt = DateTime.UtcNow;
        _unitOfWork.OrderItems.Update(item);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Served OrderItem {OrderItemId}", orderItemId);

        await _notificationService.NotifyItemStatusChangedAsync(item.OrderId, orderItemId, "Served", ct);
        await _notificationService.NotifyTableOrderRefreshAsync(item.Order.TableId, ct);
    }

    public async Task<OrderDetailResponseModel> RequestBillAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถขอบิลได้ — ออเดอร์ไม่ได้อยู่ในสถานะเปิด");

        // Check all items are in final state
        var activeItems = order.OrderItems
            .Where(i => i.Status != EOrderItemStatus.Served
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .ToList();

        if (activeItems.Count > 0)
            throw new BusinessException("ยังมีรายการที่ยังไม่เสิร์ฟ — กรุณาเสิร์ฟหรือยกเลิกรายการทั้งหมดก่อนขอบิล");

        order.Status = EOrderStatus.Billing;
        _unitOfWork.Orders.Update(order);

        // Update table status to Billing
        var table = order.Table;
        table.Status = ETableStatus.Billing;
        _unitOfWork.Tables.Update(table);

        // Create Full Bill automatically
        var servedItems = order.OrderItems
            .Where(i => i.Status == EOrderItemStatus.Served)
            .ToList();

        var subTotal = servedItems.Sum(i => i.TotalPrice);
        var serviceChargeRate = await GetActiveServiceChargeRateAsync(ct);
        const decimal vatRate = 7m;
        var serviceChargeAmount = Math.Round(subTotal * serviceChargeRate / 100, 2);
        var vatAmount = Math.Round((subTotal + serviceChargeAmount) * vatRate / 100, 2);

        var fullBill = new TbOrderBill
        {
            OrderId = orderId,
            BillNumber = await GenerateBillNumberAsync(ct),
            BillType = EBillType.Full,
            SubTotal = subTotal,
            TotalDiscountAmount = 0,
            NetAmount = subTotal,
            ServiceChargeRate = serviceChargeRate,
            ServiceChargeAmount = serviceChargeAmount,
            VatRate = vatRate,
            VatAmount = vatAmount,
            GrandTotal = subTotal + serviceChargeAmount + vatAmount,
            Status = EBillStatus.Pending
        };

        await _unitOfWork.OrderBills.AddAsync(fullBill, ct);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Order {OrderId} requested bill, Table {TableId} → Billing, Full bill created (GrandTotal: {GrandTotal})", orderId, table.TableId, fullBill.GrandTotal);

        await _notificationService.NotifyOrderUpdatedAsync(orderId, "Billing", ct);

        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "REQUEST_BILL",
            Title = "เรียกเก็บเงิน",
            Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} ขอเรียกเก็บเงิน (ยอด {fullBill.GrandTotal:N2} บาท)",
            TableId = table.TableId,
            OrderId = orderId,
            TargetGroup = "Cashier"
        }, ct);

        return await GetOrderByIdAsync(orderId, ct);
    }

    public async Task<List<OrderBillResponseModel>> SplitBillByItemAsync(int orderId, SplitByItemRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ต้องขอบิลก่อนถึงจะแยกบิลได้");

        // Get active service charge rate
        var serviceChargeRate = await GetActiveServiceChargeRateAsync(ct);
        const decimal vatRate = 7m;

        var allServedItemIds = order.OrderItems
            .Where(i => i.Status == EOrderItemStatus.Served)
            .Select(i => i.OrderItemId)
            .ToHashSet();

        // Validate all item IDs exist and are served
        var requestedIds = request.Groups.SelectMany(g => g.OrderItemIds).ToHashSet();
        if (!requestedIds.IsSubsetOf(allServedItemIds))
            throw new BusinessException("รายการบางรายการไม่ถูกต้องหรือยังไม่ได้เสิร์ฟ");

        if (!allServedItemIds.IsSubsetOf(requestedIds))
            throw new BusinessException("ต้องจัดกลุ่มรายการที่เสิร์ฟแล้วทั้งหมด");

        // Delete existing bills
        var existingBills = await _unitOfWork.OrderBills.GetAll()
            .Where(b => b.OrderId == orderId)
            .ToListAsync(ct);
        foreach (var b in existingBills) b.DeleteFlag = true;
        _unitOfWork.OrderBills.UpdateRange(existingBills);

        var bills = new List<TbOrderBill>();
        var billDate = DateTime.UtcNow.ToString("yyyyMMdd");

        for (int i = 0; i < request.Groups.Count; i++)
        {
            var groupItemIds = request.Groups[i].OrderItemIds.ToHashSet();
            var groupItems = order.OrderItems.Where(item => groupItemIds.Contains(item.OrderItemId)).ToList();

            var subTotal = groupItems.Sum(item => item.TotalPrice);
            var serviceChargeAmount = Math.Round(subTotal * serviceChargeRate / 100, 2);
            var vatAmount = Math.Round((subTotal + serviceChargeAmount) * vatRate / 100, 2);

            var bill = new TbOrderBill
            {
                OrderId = orderId,
                BillNumber = await GenerateBillNumberAsync(ct),
                BillType = EBillType.ByItem,
                SubTotal = subTotal,
                TotalDiscountAmount = 0,
                NetAmount = subTotal,
                ServiceChargeRate = serviceChargeRate,
                ServiceChargeAmount = serviceChargeAmount,
                VatRate = vatRate,
                VatAmount = vatAmount,
                GrandTotal = subTotal + serviceChargeAmount + vatAmount,
                Status = EBillStatus.Pending
            };

            await _unitOfWork.OrderBills.AddAsync(bill, ct);
            bills.Add(bill);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Split bill by item for Order {OrderId}, {Count} bills", orderId, bills.Count);

        return await GetOrderBillsAsync(orderId, ct);
    }

    public async Task<List<OrderBillResponseModel>> SplitBillByAmountAsync(int orderId, SplitByAmountRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ต้องขอบิลก่อนถึงจะแยกบิลได้");

        var serviceChargeRate = await GetActiveServiceChargeRateAsync(ct);
        const decimal vatRate = 7m;

        var totalSubTotal = order.OrderItems
            .Where(i => i.Status == EOrderItemStatus.Served)
            .Sum(i => i.TotalPrice);

        var splitAmount = Math.Round(totalSubTotal / request.NumberOfSplits, 2);
        var remainder = totalSubTotal - (splitAmount * request.NumberOfSplits);

        // Delete existing bills
        var existingBills = await _unitOfWork.OrderBills.GetAll()
            .Where(b => b.OrderId == orderId)
            .ToListAsync(ct);
        foreach (var b in existingBills) b.DeleteFlag = true;
        _unitOfWork.OrderBills.UpdateRange(existingBills);

        for (int i = 0; i < request.NumberOfSplits; i++)
        {
            var subTotal = i == 0 ? splitAmount + remainder : splitAmount;
            var serviceChargeAmount = Math.Round(subTotal * serviceChargeRate / 100, 2);
            var vatAmount = Math.Round((subTotal + serviceChargeAmount) * vatRate / 100, 2);

            var bill = new TbOrderBill
            {
                OrderId = orderId,
                BillNumber = await GenerateBillNumberAsync(ct),
                BillType = EBillType.ByAmount,
                SubTotal = subTotal,
                TotalDiscountAmount = 0,
                NetAmount = subTotal,
                ServiceChargeRate = serviceChargeRate,
                ServiceChargeAmount = serviceChargeAmount,
                VatRate = vatRate,
                VatAmount = vatAmount,
                GrandTotal = subTotal + serviceChargeAmount + vatAmount,
                Status = EBillStatus.Pending
            };

            await _unitOfWork.OrderBills.AddAsync(bill, ct);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Split bill by amount for Order {OrderId}, {Count} splits", orderId, request.NumberOfSplits);

        return await GetOrderBillsAsync(orderId, ct);
    }

    public async Task<List<OrderBillResponseModel>> GetOrderBillsAsync(int orderId, CancellationToken ct = default)
    {
        var bills = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.OrderId == orderId)
            .OrderBy(b => b.CreatedAt)
            .ToListAsync(ct);

        return bills.Select(OrderBillMapper.ToResponse).ToList();
    }

    public async Task<OrderBillResponseModel> UpdateBillChargesAsync(int orderBillId, UpdateBillChargesRequestModel request, CancellationToken ct = default)
    {
        var bill = await _unitOfWork.OrderBills.GetAll()
            .FirstOrDefaultAsync(b => b.OrderBillId == orderBillId, ct)
            ?? throw new EntityNotFoundException("OrderBill", orderBillId);

        if (bill.Status != EBillStatus.Pending)
            throw new BusinessException("ไม่สามารถแก้ไขบิลที่ชำระเงินแล้ว");

        decimal serviceChargeRate = 0;
        if (request.ServiceChargeId.HasValue)
        {
            var sc = await _unitOfWork.ServiceCharges.QueryNoTracking()
                .FirstOrDefaultAsync(s => s.ServiceChargeId == request.ServiceChargeId.Value, ct)
                ?? throw new EntityNotFoundException("ServiceCharge", request.ServiceChargeId.Value);

            serviceChargeRate = sc.PercentageRate;
        }

        bill.ServiceChargeRate = serviceChargeRate;
        bill.ServiceChargeAmount = Math.Round(bill.SubTotal * serviceChargeRate / 100, 2);
        bill.VatAmount = Math.Round((bill.SubTotal + bill.ServiceChargeAmount) * bill.VatRate / 100, 2);
        bill.GrandTotal = bill.SubTotal + bill.ServiceChargeAmount + bill.VatAmount;

        _unitOfWork.OrderBills.Update(bill);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated bill {OrderBillId} charges: SC {Rate}%, GrandTotal {GrandTotal}",
            orderBillId, serviceChargeRate, bill.GrandTotal);

        return OrderBillMapper.ToResponse(bill);
    }

    public async Task<List<ServiceChargeOptionModel>> GetServiceChargeOptionsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var items = await _unitOfWork.ServiceCharges.QueryNoTracking()
            .Where(s => s.IsActive
                && (!s.StartDate.HasValue || s.StartDate.Value <= now)
                && (!s.EndDate.HasValue || s.EndDate.Value >= now))
            .OrderBy(s => s.PercentageRate)
            .ToListAsync(ct);

        return items.Select(s => new ServiceChargeOptionModel
        {
            ServiceChargeId = s.ServiceChargeId,
            Name = s.Name,
            PercentageRate = s.PercentageRate
        }).ToList();
    }

    // ─── Private Helpers ──────────────────────────────

    private async Task<TbOrder?> GetOrderWithDetailsAsync(int orderId, CancellationToken ct)
    {
        return await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.Table)
                .ThenInclude(t => t.Zone)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.OrderItemOptions)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.CancelledByEmployee)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Menu)
                .ThenInclude(m => m.SubCategory)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct);
    }

    private async Task RecalculateSubTotalAsync(TbOrder order, CancellationToken ct)
    {
        var subTotal = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(i => i.OrderId == order.OrderId
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .SumAsync(i => i.TotalPrice, ct);

        order.SubTotal = subTotal;
        _unitOfWork.Orders.Update(order);
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = $"ORD-{today:yyyyMMdd}-";

        var lastOrder = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (lastOrder != null)
        {
            var lastPart = lastOrder.OrderNumber.Split('-').Last();
            if (int.TryParse(lastPart, out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"{prefix}{nextNumber:D3}";
    }

    private async Task<string> GenerateBillNumberAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = $"BILL-{today:yyyyMMdd}-";

        var lastBill = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.BillNumber.StartsWith(prefix))
            .OrderByDescending(b => b.BillNumber)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (lastBill != null)
        {
            var lastPart = lastBill.BillNumber.Split('-').Last();
            if (int.TryParse(lastPart, out var lastNum))
                nextNumber = lastNum + 1;
        }

        return $"{prefix}{nextNumber:D3}";
    }

    private async Task<decimal> GetActiveServiceChargeRateAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var sc = await _unitOfWork.ServiceCharges.QueryNoTracking()
            .Where(s => s.IsActive
                && (!s.StartDate.HasValue || s.StartDate.Value <= now)
                && (!s.EndDate.HasValue || s.EndDate.Value >= now))
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return sc?.PercentageRate ?? 0;
    }

    private async Task<string> GetCurrentEmployeeNameAsync(CancellationToken ct)
    {
        var employeeId = GetCurrentEmployeeId();
        if (employeeId == null) return "ระบบ";

        var emp = await _unitOfWork.Employees.QueryNoTracking()
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId.Value, ct);

        return emp != null ? $"{emp.FirstNameThai} {emp.LastNameThai}" : "ระบบ";
    }

    private int? GetCurrentEmployeeId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("employee_id")?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}
