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
using POS.Main.Core.Helpers;
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

        var results = items.Select(OrderMapper.ToResponse).ToList();

        // Enrich linked table info
        var tableIds = results.Select(r => r.TableId).Distinct().ToList();
        var linkedTableIds = await _unitOfWork.TableLinks.QueryNoTracking()
            .Where(tl => tableIds.Contains(tl.TableId))
            .Select(tl => tl.TableId)
            .ToListAsync(ct);

        foreach (var r in results)
        {
            r.IsLinked = linkedTableIds.Contains(r.TableId);
        }

        return new PaginationResult<OrderResponseModel>
        {
            Results = results,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<OrderDetailResponseModel> GetOrderByIdAsync(int orderId, CancellationToken ct = default)
    {
        var order = await GetOrderWithDetailsAsync(orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        var result = OrderMapper.ToDetailResponse(order);
        await ResolveOrderedByAsync(result.Items, ct);
        await EnrichLinkedTableInfoAsync(result, order.TableId, ct);
        return result;
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
        // ใช้ ActiveOrderId จากโต๊ะ เพื่อรองรับโต๊ะที่เชื่อมกัน (linked tables)
        var table = await _unitOfWork.Tables.QueryNoTracking()
            .FirstOrDefaultAsync(t => t.TableId == tableId, ct);

        if (table?.ActiveOrderId == null) return null;

        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.OrderItemOptions)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.CancelledByEmployee)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.SourceTable)
            .FirstOrDefaultAsync(o => o.OrderId == table.ActiveOrderId.Value
                && (o.Status == EOrderStatus.Open || o.Status == EOrderStatus.Billing), ct);

        if (order == null) return null;
        var result = OrderMapper.ToDetailResponse(order);
        await ResolveOrderedByAsync(result.Items, ct);
        return result;
    }

    public async Task<OrderDetailResponseModel> AddOrderItemsAsync(int orderId, AddOrderItemsRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.Table)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถเพิ่มรายการได้ — ออเดอร์ไม่ได้อยู่ในสถานะเปิด");

        var orderedByName = GetCurrentStaffIdentifier();
        var newItems = new List<TbOrderItem>();

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
                Status = EOrderItemStatus.Pending,
                SourceTableId = order.TableId
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
                    AdditionalPrice = optItem.AdditionalPrice,
                    CostPrice = optItem.CostPrice
                });

                optionsTotal += optItem.AdditionalPrice;
            }

            orderItem.OptionsTotalPrice = optionsTotal;
            orderItem.TotalPrice = (menu.Price + optionsTotal) * itemReq.Quantity;

            await _unitOfWork.OrderItems.AddAsync(orderItem, ct);
            newItems.Add(orderItem);
        }

        await _unitOfWork.CommitAsync(ct);

        await RecalculateSubTotalAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Added {Count} items to Order {OrderId}", request.Items.Count, orderId);

        if (request.SendToKitchen && newItems.Count > 0)
        {
            var now = DateTimeHelper.BangkokNow();
            foreach (var item in newItems)
            {
                item.Status = EOrderItemStatus.Sent;
                item.SentToKitchenAt = now;
            }

            _unitOfWork.OrderItems.UpdateRange(newItems);
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Sent {Count} new items to kitchen for Order {OrderId}", newItems.Count, orderId);

            await _notificationService.NotifyNewOrderItemsAsync(orderId, order.TableId, ct);
            await _notificationService.NotifyTableStatusChangedAsync(order.TableId, ETableStatus.Occupied.ToString(), ct);

            var groupedByCategory = newItems.GroupBy(i => i.CategoryType);
            foreach (var catGroup in groupedByCategory)
            {
                var categoryLabel = catGroup.Key switch
                {
                    (int)EMenuCategory.Food => "ครัวอาหาร",
                    (int)EMenuCategory.Beverage => "บาร์เครื่องดื่ม",
                    (int)EMenuCategory.Dessert => "ครัวของหวาน",
                    _ => "ครัว"
                };
                await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
                {
                    EventType = "NEW_ORDER",
                    Title = $"ออเดอร์ใหม่ส่ง{categoryLabel}",
                    Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} — {catGroup.Count()} รายการ",
                    TableId = order.TableId,
                    OrderId = orderId,
                    TargetGroup = "Kitchen"
                }, ct);
            }
        }

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

        var now = DateTimeHelper.BangkokNow();
        foreach (var item in pendingItems)
        {
            item.Status = EOrderItemStatus.Sent;
            item.SentToKitchenAt = now;
        }

        _unitOfWork.OrderItems.UpdateRange(pendingItems);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Sent {Count} items to kitchen for Order {OrderId}", pendingItems.Count, orderId);

        await _notificationService.NotifyNewOrderItemsAsync(orderId, order.TableId, ct);
        await _notificationService.NotifyTableStatusChangedAsync(order.TableId, ETableStatus.Occupied.ToString(), ct);

        var groupedByCategory = pendingItems.GroupBy(i => i.CategoryType);
        foreach (var catGroup in groupedByCategory)
        {
            var categoryLabel = catGroup.Key switch
            {
                (int)EMenuCategory.Food => "ครัวอาหาร",
                (int)EMenuCategory.Beverage => "บาร์เครื่องดื่ม",
                (int)EMenuCategory.Dessert => "ครัวของหวาน",
                _ => "ครัว"
            };
            await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "NEW_ORDER",
                Title = $"ออเดอร์ใหม่ส่ง{categoryLabel}",
                Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} — {catGroup.Count()} รายการ",
                TableId = order.TableId,
                OrderId = orderId,
                TargetGroup = "Kitchen"
            }, ct);
        }

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
        item.ServedAt = DateTimeHelper.BangkokNow();
        _unitOfWork.OrderItems.Update(item);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Served OrderItem {OrderItemId}", orderItemId);

        await _notificationService.NotifyItemStatusChangedAsync(item.OrderId, orderItemId, item.Order.TableId, "Served", ct);
        await _notificationService.NotifyTableOrderRefreshAsync(item.Order.TableId, ct);
    }

    public async Task ServeAllReadyItemsAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        var readyItems = await _unitOfWork.OrderItems.GetAll()
            .Where(i => i.OrderId == orderId && i.Status == EOrderItemStatus.Ready)
            .ToListAsync(ct);

        if (readyItems.Count == 0)
            throw new BusinessException("ไม่มีรายการที่พร้อมเสิร์ฟ");

        foreach (var item in readyItems)
        {
            item.Status = EOrderItemStatus.Served;
            item.ServedAt = DateTimeHelper.BangkokNow();
            _unitOfWork.OrderItems.Update(item);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Served all {Count} ready items for Order {OrderId}", readyItems.Count, orderId);

        foreach (var item in readyItems)
        {
            await _notificationService.NotifyItemStatusChangedAsync(orderId, item.OrderItemId, order.TableId, "Served", ct);
        }
        await _notificationService.NotifyTableOrderRefreshAsync(order.TableId, ct);
    }

    public async Task<OrderDetailResponseModel> RequestBillAsync(int orderId, bool force = false, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.Table)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open && order.Status != EOrderStatus.Billing)
            throw new BusinessException("ไม่สามารถขอบิลได้ — ออเดอร์ไม่ได้อยู่ในสถานะที่ถูกต้อง");

        // ถ้าสถานะ Billing แล้ว (ลูกค้าขอบิลมาก่อน) ต้องเช็คว่ายังไม่มี bill
        if (order.Status == EOrderStatus.Billing)
        {
            var existingBills = await _unitOfWork.OrderBills.QueryNoTracking()
                .AnyAsync(b => b.OrderId == orderId, ct);
            if (existingBills)
                throw new BusinessException("ออเดอร์นี้มีบิลอยู่แล้ว");
        }

        // Check all items are in final state
        var activeItems = order.OrderItems
            .Where(i => i.Status != EOrderItemStatus.Served
                && i.Status != EOrderItemStatus.Voided
                && i.Status != EOrderItemStatus.Cancelled)
            .ToList();

        if (activeItems.Count > 0)
        {
            if (!force)
                throw new BusinessException("ยังมีรายการที่ยังไม่เสิร์ฟ — กรุณาเสิร์ฟหรือยกเลิกรายการทั้งหมดก่อนขอบิล");

            // force=true → ตรวจว่ามีรายการ served อย่างน้อย 1 รายการ
            if (!order.OrderItems.Any(i => i.Status == EOrderItemStatus.Served))
                throw new BusinessException("ไม่มีรายการที่เสิร์ฟแล้ว ไม่สามารถสร้างบิลได้");
        }

        var table = order.Table;

        // เปลี่ยนสถานะเฉพาะตอน Open → Billing (ถ้า Billing อยู่แล้วไม่ต้องเปลี่ยน)
        var isStatusChange = order.Status == EOrderStatus.Open;
        if (isStatusChange)
        {
            order.Status = EOrderStatus.Billing;
            _unitOfWork.Orders.Update(order);

            table.Status = ETableStatus.Billing;
            _unitOfWork.Tables.Update(table);

            var linkedTableIds = await GetLinkedTableIdsAsync(table.TableId, ct);
            if (linkedTableIds != null)
            {
                foreach (var ltId in linkedTableIds.Where(id => id != table.TableId))
                {
                    var lt = await _unitOfWork.Tables.GetByIdAsync(ltId, ct);
                    if (lt != null)
                    {
                        lt.Status = ETableStatus.Billing;
                        _unitOfWork.Tables.Update(lt);
                    }
                }
            }
        }

        // Create Full Bill automatically
        var servedItems = order.OrderItems
            .Where(i => i.Status == EOrderItemStatus.Served)
            .ToList();

        var subTotal = servedItems.Sum(i => i.TotalPrice);
        const decimal vatRate = 7m;
        var vatAmount = Math.Round(subTotal * vatRate / 100, 2);

        var fullBill = new TbOrderBill
        {
            OrderId = orderId,
            BillNumber = await GenerateBillNumberAsync(ct),
            BillType = EBillType.Full,
            SubTotal = subTotal,
            TotalDiscountAmount = 0,
            NetAmount = subTotal,
            ServiceChargeId = null,
            ServiceChargeRate = 0,
            ServiceChargeAmount = 0,
            VatRate = vatRate,
            VatAmount = vatAmount,
            GrandTotal = subTotal + vatAmount,
            Status = EBillStatus.Pending
        };

        await _unitOfWork.OrderBills.AddAsync(fullBill, ct);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Order {OrderId} requested bill, Table {TableId} → Billing, Full bill created (GrandTotal: {GrandTotal})", orderId, table.TableId, fullBill.GrandTotal);

        if (isStatusChange)
        {
            await _notificationService.NotifyOrderUpdatedAsync(orderId, "Billing", ct);

            await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "REQUEST_BILL",
                Title = "เรียกเก็บเงิน",
                Message = $"ออเดอร์ #{order.OrderNumber.Split('-').Last()} ขอเรียกเก็บเงิน\nจำนวนเงิน {fullBill.GrandTotal:N2} บาท",
                TableId = table.TableId,
                OrderId = orderId,
                TargetGroup = "Cashier"
            }, ct);
        }

        return await GetOrderByIdAsync(orderId, ct);
    }

    public async Task SendBillToCustomerAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.OrderId == orderId)
            .Select(o => new { o.OrderId, o.Status, TableId = o.Table!.TableId })
            .FirstOrDefaultAsync(ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ออเดอร์ไม่ได้อยู่ในสถานะรอชำระ");

        await _notificationService.NotifyTableOrderRefreshAsync(order.TableId, ct);

        _logger.LogInformation("Bill sent to customer for Order {OrderId}, Table {TableId}", orderId, order.TableId);
    }

    public async Task<OrderDetailResponseModel> VoidBillAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.Table)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ไม่สามารถยกเลิกบิลได้ — ออเดอร์ไม่ได้อยู่ในสถานะรอชำระ");

        // Hard delete OrderBills ที่ยัง Pending
        var pendingBills = await _unitOfWork.OrderBills.GetAll()
            .Where(b => b.OrderId == orderId && b.Status == EBillStatus.Pending)
            .ToListAsync(ct);

        if (pendingBills.Count > 0)
            _unitOfWork.OrderBills.DeleteRange(pendingBills);

        // Revert Order → Open
        order.Status = EOrderStatus.Open;
        _unitOfWork.Orders.Update(order);

        // Revert Table → Occupied (+ linked tables)
        var table = order.Table;
        table.Status = ETableStatus.Occupied;
        _unitOfWork.Tables.Update(table);

        var linkedTableIds = await GetLinkedTableIdsAsync(table.TableId, ct);
        if (linkedTableIds != null)
        {
            foreach (var ltId in linkedTableIds.Where(id => id != table.TableId))
            {
                var lt = await _unitOfWork.Tables.GetByIdAsync(ltId, ct);
                if (lt != null)
                {
                    lt.Status = ETableStatus.Occupied;
                    _unitOfWork.Tables.Update(lt);
                }
            }
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Voided bill for Order {OrderId}, Table {TableId} → Open/Occupied", orderId, table.TableId);

        await _notificationService.NotifyOrderUpdatedAsync(orderId, "Open", ct);
        await _notificationService.NotifyTableStatusChangedAsync(table.TableId, ETableStatus.Occupied.ToString(), ct);
        await _notificationService.NotifyBillVoidedAsync(table.TableId, ct);
        if (linkedTableIds != null)
        {
            foreach (var ltId in linkedTableIds.Where(id => id != table.TableId))
                await _notificationService.NotifyTableStatusChangedAsync(ltId, ETableStatus.Occupied.ToString(), ct);
        }

        return await GetOrderByIdAsync(orderId, ct);
    }

    public async Task<List<OrderBillResponseModel>> SplitBillByItemAsync(int orderId, SplitByItemRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ต้องขอบิลก่อนถึงจะแยกบิลได้");

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

        // Clear existing OrderBillId on items
        foreach (var item in order.OrderItems)
            item.OrderBillId = null;

        // Delete existing bills
        var existingBills = await _unitOfWork.OrderBills.GetAll()
            .Where(b => b.OrderId == orderId)
            .ToListAsync(ct);
        foreach (var b in existingBills) b.DeleteFlag = true;
        _unitOfWork.OrderBills.UpdateRange(existingBills);

        var bills = new List<TbOrderBill>();
        var nextSeq = await GetNextBillSequenceAsync(ct);

        for (int i = 0; i < request.Groups.Count; i++)
        {
            var groupItemIds = request.Groups[i].OrderItemIds.ToHashSet();
            var groupItems = order.OrderItems.Where(item => groupItemIds.Contains(item.OrderItemId)).ToList();

            var subTotal = groupItems.Sum(item => item.TotalPrice);
            var vatAmount = Math.Round(subTotal * vatRate / 100, 2);

            var bill = new TbOrderBill
            {
                OrderId = orderId,
                BillNumber = FormatBillNumber(nextSeq + i),
                BillType = EBillType.ByItem,
                SubTotal = subTotal,
                TotalDiscountAmount = 0,
                NetAmount = subTotal,
                ServiceChargeId = null,
                ServiceChargeRate = 0,
                ServiceChargeAmount = 0,
                VatRate = vatRate,
                VatAmount = vatAmount,
                GrandTotal = subTotal + vatAmount,
                SplitCount = request.Groups.Count,
                SplitIndex = i + 1,
                Status = EBillStatus.Pending
            };

            await _unitOfWork.OrderBills.AddAsync(bill, ct);
            bills.Add(bill);

            // Link items to this bill (use navigation property so EF inserts bill before updating items)
            foreach (var item in groupItems)
                item.OrderBill = bill;
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Split bill by item for Order {OrderId}, {Count} bills", orderId, bills.Count);

        // Notify customer (Mobile Web) via SignalR
        var tableId = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.OrderId == orderId)
            .Select(o => o.Table!.TableId)
            .FirstOrDefaultAsync(ct);
        if (tableId > 0)
            await _notificationService.NotifyTableOrderRefreshAsync(tableId, ct);

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

        var nextSeq = await GetNextBillSequenceAsync(ct);

        for (int i = 0; i < request.NumberOfSplits; i++)
        {
            var subTotal = i == 0 ? splitAmount + remainder : splitAmount;
            var vatAmount = Math.Round(subTotal * vatRate / 100, 2);

            var bill = new TbOrderBill
            {
                OrderId = orderId,
                BillNumber = FormatBillNumber(nextSeq + i),
                BillType = EBillType.ByAmount,
                SubTotal = subTotal,
                TotalDiscountAmount = 0,
                NetAmount = subTotal,
                ServiceChargeId = null,
                ServiceChargeRate = 0,
                ServiceChargeAmount = 0,
                VatRate = vatRate,
                VatAmount = vatAmount,
                GrandTotal = subTotal + vatAmount,
                SplitCount = request.NumberOfSplits,
                SplitIndex = i + 1,
                Status = EBillStatus.Pending
            };

            await _unitOfWork.OrderBills.AddAsync(bill, ct);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Split bill by amount for Order {OrderId}, {Count} splits", orderId, request.NumberOfSplits);

        // Notify customer (Mobile Web) via SignalR
        var tableId = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.OrderId == orderId)
            .Select(o => o.Table!.TableId)
            .FirstOrDefaultAsync(ct);
        if (tableId > 0)
            await _notificationService.NotifyTableOrderRefreshAsync(tableId, ct);

        return await GetOrderBillsAsync(orderId, ct);
    }

    public async Task<List<OrderBillResponseModel>> UnsplitBillAsync(int orderId, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Billing)
            throw new BusinessException("ไม่สามารถรวมบิลได้ — ออเดอร์ไม่ได้อยู่ในสถานะรอชำระ");

        var allBills = await _unitOfWork.OrderBills.GetAll()
            .Where(b => b.OrderId == orderId)
            .ToListAsync(ct);

        if (allBills.Count <= 1)
            throw new BusinessException("ไม่มีบิลที่แยกไว้");

        if (allBills.Any(b => b.Status == EBillStatus.Paid))
            throw new BusinessException("ไม่สามารถรวมบิลได้ — มีบิลที่ชำระแล้ว");

        // Hard delete all split bills
        _unitOfWork.OrderBills.DeleteRange(allBills);

        // Clear OrderBillId from items
        foreach (var item in order.OrderItems)
            item.OrderBillId = null;

        // Create Full Bill
        var servedItems = order.OrderItems
            .Where(i => i.Status == EOrderItemStatus.Served)
            .ToList();

        var subTotal = servedItems.Sum(i => i.TotalPrice);
        const decimal vatRate = 7m;
        var vatAmount = Math.Round(subTotal * vatRate / 100, 2);

        var fullBill = new TbOrderBill
        {
            OrderId = orderId,
            BillNumber = await GenerateBillNumberAsync(ct),
            BillType = EBillType.Full,
            SubTotal = subTotal,
            TotalDiscountAmount = 0,
            NetAmount = subTotal,
            ServiceChargeId = null,
            ServiceChargeRate = 0,
            ServiceChargeAmount = 0,
            VatRate = vatRate,
            VatAmount = vatAmount,
            GrandTotal = subTotal + vatAmount,
            Status = EBillStatus.Pending
        };

        await _unitOfWork.OrderBills.AddAsync(fullBill, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Unsplit bill for Order {OrderId}, reverted to Full Bill", orderId);

        // Notify customer (Mobile Web) via SignalR
        var tableId = await _unitOfWork.Orders.QueryNoTracking()
            .Where(o => o.OrderId == orderId)
            .Select(o => o.Table!.TableId)
            .FirstOrDefaultAsync(ct);
        if (tableId > 0)
            await _notificationService.NotifyTableOrderRefreshAsync(tableId, ct);

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

        bill.ServiceChargeId = request.ServiceChargeId;
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

    public async Task SendItemToKitchenAsync(int orderItemId, CancellationToken ct = default)
    {
        var item = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => i.OrderItemId == orderItemId, ct)
            ?? throw new EntityNotFoundException("OrderItem", orderItemId);

        if (item.Status != EOrderItemStatus.Pending)
            throw new BusinessException("รายการนี้ไม่ได้อยู่ในสถานะรอส่งครัว");

        if (item.Order.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถส่งครัวได้ — ออเดอร์ไม่ได้อยู่ในสถานะเปิด");

        item.Status = EOrderItemStatus.Sent;
        item.SentToKitchenAt = DateTimeHelper.BangkokNow();
        _unitOfWork.OrderItems.Update(item);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Sent item {OrderItemId} to kitchen for Order {OrderId}", orderItemId, item.OrderId);

        await _notificationService.NotifyNewOrderItemsAsync(item.OrderId, item.Order.TableId, ct);
        await _notificationService.NotifyTableStatusChangedAsync(item.Order.TableId, ETableStatus.Occupied.ToString(), ct);

        var categoryLabel = item.CategoryType switch
        {
            (int)EMenuCategory.Food => "ครัวอาหาร",
            (int)EMenuCategory.Beverage => "บาร์เครื่องดื่ม",
            (int)EMenuCategory.Dessert => "ครัวของหวาน",
            _ => "ครัว"
        };
        await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
        {
            EventType = "NEW_ORDER",
            Title = $"ออเดอร์ส่ง{categoryLabel}",
            Message = $"ออเดอร์ #{item.Order.OrderNumber.Split('-').Last()} — 1 รายการ",
            TableId = item.Order.TableId,
            OrderId = item.OrderId,
            TargetGroup = "Kitchen"
        }, ct);
    }

    public async Task UpdateGuestCountAsync(int orderId, UpdateGuestCountRequestModel request, CancellationToken ct = default)
    {
        var order = await _unitOfWork.Orders.GetAll()
            .FirstOrDefaultAsync(o => o.OrderId == orderId, ct)
            ?? throw new EntityNotFoundException("Order", orderId);

        if (order.Status != EOrderStatus.Open && order.Status != EOrderStatus.Billing)
            throw new BusinessException("ไม่สามารถแก้ไขจำนวนลูกค้าได้ — ออเดอร์ไม่ได้อยู่ในสถานะที่ถูกต้อง");

        order.GuestCount = request.GuestCount;
        _unitOfWork.Orders.Update(order);

        var table = await _unitOfWork.Tables.GetByIdAsync(order.TableId, ct);
        if (table != null)
        {
            table.CurrentGuests = request.GuestCount;
            _unitOfWork.Tables.Update(table);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated guest count for Order {OrderId} to {GuestCount}", orderId, request.GuestCount);

        await _notificationService.NotifyTableStatusChangedAsync(order.TableId, table?.Status.ToString() ?? "Occupied", ct);
    }

    // ─── Private Helpers ──────────────────────────────

    private async Task EnrichLinkedTableInfoAsync(OrderDetailResponseModel result, int tableId, CancellationToken ct)
    {
        var link = await _unitOfWork.TableLinks.QueryNoTracking()
            .FirstOrDefaultAsync(tl => tl.TableId == tableId, ct);

        if (link == null) return;

        var allLinks = await _unitOfWork.TableLinks.QueryNoTracking()
            .Where(tl => tl.GroupCode == link.GroupCode)
            .Join(
                _unitOfWork.Tables.QueryNoTracking(),
                tl => tl.TableId,
                t => t.TableId,
                (tl, t) => new { tl.IsPrimary, t.TableName, t.CurrentGuests })
            .ToListAsync(ct);

        result.IsLinked = true;
        result.PrimaryTableName = allLinks.FirstOrDefault(l => l.IsPrimary)?.TableName;
        result.SecondaryTableNames = allLinks.Where(l => !l.IsPrimary).Select(l => l.TableName).ToList();
        result.LinkedTables = allLinks.Select(l => new OrderLinkedTableModel
        {
            TableName = l.TableName,
            GuestCount = l.CurrentGuests ?? 0,
            IsPrimary = l.IsPrimary
        }).ToList();
        result.TotalGuestCount = allLinks.Sum(l => l.CurrentGuests ?? 0);
    }

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
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.SourceTable)
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
        var today = DateTimeHelper.BangkokNow().Date;
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
        var nextSeq = await GetNextBillSequenceAsync(ct);
        return FormatBillNumber(nextSeq);
    }

    private async Task<int> GetNextBillSequenceAsync(CancellationToken ct)
    {
        var today = DateTimeHelper.BangkokNow().Date;
        var prefix = $"BILL-{today:yyyyMMdd}-";

        var lastBill = await _unitOfWork.OrderBills.QueryNoTracking()
            .Where(b => b.BillNumber.StartsWith(prefix))
            .OrderByDescending(b => b.BillNumber)
            .FirstOrDefaultAsync(ct);

        if (lastBill != null)
        {
            var lastPart = lastBill.BillNumber.Split('-').Last();
            if (int.TryParse(lastPart, out var lastNum))
                return lastNum + 1;
        }

        return 1;
    }

    private static string FormatBillNumber(int sequence)
    {
        return $"BILL-{DateTimeHelper.BangkokNow():yyyyMMdd}-{sequence:D3}";
    }

    private string GetCurrentStaffIdentifier()
    {
        var employeeId = GetCurrentEmployeeId();
        return employeeId != null ? $"staff:{employeeId}" : "ระบบ";
    }

    private async Task ResolveOrderedByAsync(List<OrderItemResponseModel> items, CancellationToken ct)
    {
        if (items.Count == 0) return;

        var customerIds = new HashSet<int>();
        var staffIds = new HashSet<int>();

        foreach (var item in items)
        {
            if (string.IsNullOrEmpty(item.OrderedBy)) continue;
            if (item.OrderedBy.StartsWith("customer:") && int.TryParse(item.OrderedBy[9..], out var cid))
                customerIds.Add(cid);
            else if (item.OrderedBy.StartsWith("staff:") && int.TryParse(item.OrderedBy[6..], out var sid))
                staffIds.Add(sid);
        }

        var nicknameMap = new Dictionary<int, string>();
        if (customerIds.Count > 0)
        {
            nicknameMap = await _unitOfWork.CustomerSessions.QueryNoTracking()
                .Where(cs => customerIds.Contains(cs.CustomerSessionId))
                .ToDictionaryAsync(cs => cs.CustomerSessionId, cs => cs.Nickname ?? "", ct);
        }

        var staffNameMap = new Dictionary<int, string>();
        if (staffIds.Count > 0)
        {
            staffNameMap = await _unitOfWork.Employees.QueryNoTracking()
                .Where(e => staffIds.Contains(e.EmployeeId))
                .ToDictionaryAsync(e => e.EmployeeId, e => e.FirstNameThai, ct);
        }

        foreach (var item in items)
        {
            if (string.IsNullOrEmpty(item.OrderedBy)) continue;

            if (item.OrderedBy.StartsWith("customer:") && int.TryParse(item.OrderedBy[9..], out var cid))
            {
                var nick = nicknameMap.GetValueOrDefault(cid, "");
                item.OrderedBy = string.IsNullOrEmpty(nick) ? "คุณลูกค้า" : $"คุณ{nick}";
            }
            else if (item.OrderedBy.StartsWith("staff:") && int.TryParse(item.OrderedBy[6..], out var sid))
            {
                var name = staffNameMap.GetValueOrDefault(sid, "");
                item.OrderedBy = string.IsNullOrEmpty(name) ? "พนักงาน" : $"พนักงาน{name}";
            }
        }
    }

    private int? GetCurrentEmployeeId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("employee_id")?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }

    private async Task<List<int>?> GetLinkedTableIdsAsync(int tableId, CancellationToken ct)
    {
        var link = await _unitOfWork.TableLinks.QueryNoTracking()
            .FirstOrDefaultAsync(tl => tl.TableId == tableId, ct);

        if (link == null) return null;

        return await _unitOfWork.TableLinks.QueryNoTracking()
            .Where(tl => tl.GroupCode == link.GroupCode)
            .Select(tl => tl.TableId)
            .ToListAsync(ct);
    }
}
