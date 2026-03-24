using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Order.Models.Kitchen;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Order.Services;

public class KitchenService : IKitchenService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<KitchenService> _logger;
    private readonly IOrderNotificationService _notificationService;
    private readonly INotificationBroadcaster _notificationBroadcaster;

    public KitchenService(IUnitOfWork unitOfWork, ILogger<KitchenService> logger,
        IOrderNotificationService notificationService, INotificationBroadcaster notificationBroadcaster)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
        _notificationBroadcaster = notificationBroadcaster;
    }

    public async Task<List<KitchenOrderModel>> GetKitchenItemsAsync(
        int categoryType, bool includeReady = false, CancellationToken ct = default)
    {
        var statuses = new List<EOrderItemStatus>
        {
            EOrderItemStatus.Sent,
            EOrderItemStatus.Preparing,
            EOrderItemStatus.Cancelled,
            EOrderItemStatus.Voided
        };
        if (includeReady)
            statuses.Add(EOrderItemStatus.Ready);

        var items = await _unitOfWork.OrderItems.QueryNoTracking()
            .Include(i => i.Order)
                .ThenInclude(o => o.Table)
                    .ThenInclude(t => t.Zone)
            .Include(i => i.OrderItemOptions)
            .Where(i => statuses.Contains(i.Status)
                && i.CategoryType == categoryType
                && i.Order.Status == EOrderStatus.Open)
            .OrderBy(i => i.SentToKitchenAt)
            .ToListAsync(ct);

        var grouped = items
            .GroupBy(i => i.OrderId)
            .Select(g =>
            {
                var first = g.First();
                return new KitchenOrderModel
                {
                    OrderId = first.OrderId,
                    OrderNumber = first.Order.OrderNumber,
                    TableId = first.Order.TableId,
                    TableName = first.Order.Table.TableName,
                    ZoneColor = first.Order.Table.Zone?.Color,
                    OpenedAt = first.Order.Table.OpenedAt,
                    Items = g.Select(i => new KitchenOrderItemModel
                    {
                        OrderItemId = i.OrderItemId,
                        MenuId = i.MenuId,
                        MenuNameThai = i.MenuNameThai,
                        MenuNameEnglish = i.MenuNameEnglish,
                        CategoryType = i.CategoryType,
                        Quantity = i.Quantity,
                        Note = i.Note,
                        Status = i.Status.ToString(),
                        SentToKitchenAt = i.SentToKitchenAt,
                        CookingStartedAt = i.CookingStartedAt,
                        ReadyAt = i.ReadyAt,
                        CancelReason = i.CancelReason,
                        Options = i.OrderItemOptions.Select(o => new KitchenOptionModel
                        {
                            OptionGroupName = o.OptionGroupName,
                            OptionItemName = o.OptionItemName
                        }).ToList()
                    }).ToList()
                };
            })
            .ToList();

        return grouped;
    }

    public async Task StartPreparingAsync(List<int> orderItemIds, CancellationToken ct = default)
    {
        if (orderItemIds.Count == 0)
            throw new ValidationException("กรุณาเลือกรายการอย่างน้อย 1 รายการ");

        var items = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .Where(i => orderItemIds.Contains(i.OrderItemId))
            .ToListAsync(ct);

        if (items.Count != orderItemIds.Count)
            throw new EntityNotFoundException("OrderItem", string.Join(",", orderItemIds));

        foreach (var item in items)
        {
            if (item.Status != EOrderItemStatus.Sent)
                throw new BusinessException($"รายการ #{item.OrderItemId} ไม่อยู่ในสถานะ 'ส่งครัวแล้ว'");

            item.Status = EOrderItemStatus.Preparing;
            item.CookingStartedAt = DateTime.UtcNow;
            _unitOfWork.OrderItems.Update(item);
        }

        await _unitOfWork.CommitAsync(ct);

        foreach (var item in items)
        {
            await _notificationService.NotifyItemStatusChangedAsync(
                item.OrderId, item.OrderItemId, EOrderItemStatus.Preparing.ToString(), ct);
        }

        // Notify customer devices on table
        var tableIds = items.Select(i => i.Order.TableId).Distinct();
        foreach (var tableId in tableIds)
        {
            await _notificationService.NotifyTableOrderRefreshAsync(tableId, ct);
        }

        _logger.LogInformation("Started preparing {Count} items: [{ItemIds}]",
            items.Count, string.Join(",", orderItemIds));
    }

    public async Task MarkReadyAsync(List<int> orderItemIds, CancellationToken ct = default)
    {
        if (orderItemIds.Count == 0)
            throw new ValidationException("กรุณาเลือกรายการอย่างน้อย 1 รายการ");

        var items = await _unitOfWork.OrderItems.GetAll()
            .Include(i => i.Order)
            .Include(i => i.Menu)
                .ThenInclude(m => m.SubCategory)
            .Where(i => orderItemIds.Contains(i.OrderItemId))
            .ToListAsync(ct);

        if (items.Count != orderItemIds.Count)
            throw new EntityNotFoundException("OrderItem", string.Join(",", orderItemIds));

        foreach (var item in items)
        {
            if (item.Status != EOrderItemStatus.Preparing)
                throw new BusinessException($"รายการ #{item.OrderItemId} ไม่อยู่ในสถานะ 'กำลังทำ'");

            item.Status = EOrderItemStatus.Ready;
            item.ReadyAt = DateTime.UtcNow;
            _unitOfWork.OrderItems.Update(item);
        }

        await _unitOfWork.CommitAsync(ct);

        foreach (var item in items)
        {
            await _notificationService.NotifyItemStatusChangedAsync(
                item.OrderId, item.OrderItemId, EOrderItemStatus.Ready.ToString(), ct);
        }

        // Notify customer devices on table
        var readyTableIds = items.Select(i => i.Order.TableId).Distinct();
        foreach (var tableId in readyTableIds)
        {
            await _notificationService.NotifyTableOrderRefreshAsync(tableId, ct);
        }

        // Send ORDER_READY notification grouped by order + category (kitchen)
        var readyByOrderAndCategory = items.GroupBy(i => new { i.OrderId, i.CategoryType });
        foreach (var group in readyByOrderAndCategory)
        {
            var firstItem = group.First();
            var menuNames = string.Join(", ", group.Select(i => i.MenuNameThai));
            var categoryName = firstItem.Menu.SubCategory?.Name;
            var title = categoryName != null
                ? $"ออเดอร์พร้อมเสิร์ฟ — {categoryName}"
                : "ออเดอร์พร้อมเสิร์ฟ";
            await _notificationBroadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "ORDER_READY",
                Title = title,
                Message = $"ออเดอร์ #{firstItem.Order.OrderNumber.Split('-').Last()} — {menuNames}",
                TableId = firstItem.Order.TableId,
                OrderId = firstItem.OrderId,
                TargetGroup = "Floor"
            }, ct);
        }

        _logger.LogInformation("Marked ready {Count} items: [{ItemIds}]",
            items.Count, string.Join(",", orderItemIds));
    }
}
