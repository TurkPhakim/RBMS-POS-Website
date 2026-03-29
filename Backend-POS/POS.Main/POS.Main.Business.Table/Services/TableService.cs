using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Table;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Table.Services;

public class TableService : ITableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TableService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IOrderNotificationService _notificationService;

    public TableService(IUnitOfWork unitOfWork, ILogger<TableService> logger, IConfiguration configuration, IOrderNotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _configuration = configuration;
        _notificationService = notificationService;
    }

    public async Task<PaginationResult<TableResponseModel>> GetTablesAsync(
        int? zoneId, string? status, PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .AsQueryable();

        if (zoneId.HasValue)
            query = query.Where(t => t.ZoneId == zoneId.Value);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ETableStatus>(status, true, out var statusEnum))
            query = query.Where(t => t.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(t => t.TableName.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(t => t.TableId)
            .Skip(param.Skip)
            .Take(param.Take)
            .Select(t => new TableResponseModel
            {
                TableId = t.TableId,
                TableName = t.TableName,
                ZoneId = t.ZoneId,
                ZoneName = t.Zone.ZoneName,
                ZoneColor = t.Zone.Color,
                Capacity = t.Capacity,
                PositionX = t.PositionX,
                PositionY = t.PositionY,
                Size = t.Size.ToString(),
                Status = t.Status.ToString(),
                CurrentGuests = t.CurrentGuests,
                GuestType = t.GuestType != null ? t.GuestType.Value.ToString() : null,
                OpenedAt = t.OpenedAt,
                Note = t.Note,
                HasQrToken = t.QrToken != null,
                UnservedItemCount = t.ActiveOrderId.HasValue
                    ? t.ActiveOrder!.OrderItems.Count(i => !i.DeleteFlag
                        && i.Status != EOrderItemStatus.Pending
                        && i.Status != EOrderItemStatus.Voided
                        && i.Status != EOrderItemStatus.Cancelled
                        && i.Status != EOrderItemStatus.Served)
                    : 0,
                TotalActiveItemCount = t.ActiveOrderId.HasValue
                    ? t.ActiveOrder!.OrderItems.Count(i => !i.DeleteFlag
                        && i.Status != EOrderItemStatus.Pending
                        && i.Status != EOrderItemStatus.Voided
                        && i.Status != EOrderItemStatus.Cancelled)
                    : 0,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(ct);

        // Enrich linked table data
        var tableIds = items.Select(i => i.TableId).ToList();
        var links = await _unitOfWork.TableLinks.QueryNoTracking()
            .Where(tl => tableIds.Contains(tl.TableId))
            .ToListAsync(ct);

        if (links.Count > 0)
        {
            var groupCodes = links.Select(l => l.GroupCode).Distinct().ToList();
            var allGroupLinks = await _unitOfWork.TableLinks.QueryNoTracking()
                .Where(tl => groupCodes.Contains(tl.GroupCode))
                .Join(_unitOfWork.Tables.QueryNoTracking(),
                    tl => tl.TableId, t => t.TableId,
                    (tl, t) => new { tl.TableId, tl.GroupCode, t.TableName })
                .ToListAsync(ct);

            foreach (var item in items)
            {
                var link = links.FirstOrDefault(l => l.TableId == item.TableId);
                if (link != null)
                {
                    item.LinkedGroupCode = link.GroupCode;
                    item.IsLinkedPrimary = link.IsPrimary;
                    item.LinkedTableNames = allGroupLinks
                        .Where(g => g.GroupCode == link.GroupCode && g.TableId != item.TableId)
                        .Select(g => g.TableName)
                        .ToList();
                }
            }

            // Recalculate serving counts per SourceTableId for linked tables
            var linkedTableIds = items
                .Where(i => i.LinkedGroupCode != null && i.TotalActiveItemCount > 0)
                .Select(i => i.TableId)
                .ToList();

            if (linkedTableIds.Count > 0)
            {
                // All linked tables share the same ActiveOrderId (the merged order)
                var linkedTableOrderIds = await _unitOfWork.Tables.QueryNoTracking()
                    .Where(t => linkedTableIds.Contains(t.TableId) && t.ActiveOrderId.HasValue)
                    .Select(t => new { t.TableId, t.ActiveOrderId })
                    .ToListAsync(ct);

                var orderIds = linkedTableOrderIds.Select(x => x.ActiveOrderId!.Value).Distinct().ToList();

                var perSourceCounts = await _unitOfWork.OrderItems.QueryNoTracking()
                    .Where(i => orderIds.Contains(i.OrderId)
                        && !i.DeleteFlag
                        && i.Status != EOrderItemStatus.Pending
                        && i.Status != EOrderItemStatus.Voided
                        && i.Status != EOrderItemStatus.Cancelled
                        && i.SourceTableId.HasValue)
                    .GroupBy(i => i.SourceTableId)
                    .Select(g => new
                    {
                        SourceTableId = g.Key!.Value,
                        TotalCount = g.Count(),
                        UnservedCount = g.Count(i => i.Status != EOrderItemStatus.Served)
                    })
                    .ToListAsync(ct);

                foreach (var item in items.Where(i => linkedTableIds.Contains(i.TableId)))
                {
                    var counts = perSourceCounts.FirstOrDefault(c => c.SourceTableId == item.TableId);
                    item.TotalActiveItemCount = counts?.TotalCount ?? 0;
                    item.UnservedItemCount = counts?.UnservedCount ?? 0;
                }
            }
        }

        return new PaginationResult<TableResponseModel>
        {
            Results = items,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<TableResponseModel> GetTableByIdAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.QueryNoTracking()
            .Include(t => t.Zone)
            .Include(t => t.CreatedByEmployee)
            .Include(t => t.UpdatedByEmployee)
            .FirstOrDefaultAsync(t => t.TableId == tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        var link = await _unitOfWork.TableLinks.QueryNoTracking()
            .FirstOrDefaultAsync(tl => tl.TableId == tableId, ct);

        string? linkedGroupCode = link?.GroupCode;
        bool isLinkedPrimary = link?.IsPrimary ?? false;
        List<string>? linkedTableNames = null;

        if (linkedGroupCode != null)
        {
            linkedTableNames = await _unitOfWork.TableLinks.QueryNoTracking()
                .Where(tl => tl.GroupCode == linkedGroupCode && tl.TableId != tableId)
                .Join(_unitOfWork.Tables.QueryNoTracking(), tl => tl.TableId, t => t.TableId, (tl, t) => t.TableName)
                .ToListAsync(ct);
        }

        return TableMapper.ToResponse(entity, linkedGroupCode, linkedTableNames, isLinkedPrimary);
    }

    public async Task<TableResponseModel> CreateTableAsync(
        CreateTableRequestModel request, CancellationToken ct = default)
    {
        var zoneExists = await _unitOfWork.Zones.QueryNoTracking()
            .AnyAsync(z => z.ZoneId == request.ZoneId, ct);
        if (!zoneExists)
            throw new EntityNotFoundException("Zone", request.ZoneId);

        var duplicate = await _unitOfWork.Tables.QueryNoTracking()
            .AnyAsync(t => t.TableName == request.TableName, ct);
        if (duplicate)
            throw new ValidationException("ชื่อโต๊ะนี้ถูกใช้แล้ว");

        var entity = TableMapper.ToEntity(request);

        await _unitOfWork.Tables.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created Table {TableId} Name={TableName} Zone={ZoneId}",
            entity.TableId, entity.TableName, entity.ZoneId);

        return await GetTableByIdAsync(entity.TableId, ct);
    }

    public async Task<TableResponseModel> UpdateTableAsync(
        int tableId, UpdateTableRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        var zoneExists = await _unitOfWork.Zones.QueryNoTracking()
            .AnyAsync(z => z.ZoneId == request.ZoneId, ct);
        if (!zoneExists)
            throw new EntityNotFoundException("Zone", request.ZoneId);

        var duplicate = await _unitOfWork.Tables.QueryNoTracking()
            .AnyAsync(t => t.TableName == request.TableName && t.TableId != tableId, ct);
        if (duplicate)
            throw new ValidationException("ชื่อโต๊ะนี้ถูกใช้แล้ว");

        TableMapper.UpdateEntity(entity, request);
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated Table {TableId}", tableId);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task DeleteTableAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status == ETableStatus.Occupied || entity.Status == ETableStatus.Billing)
            throw new BusinessException("ไม่สามารถลบโต๊ะที่กำลังใช้งาน");

        entity.DeleteFlag = true;
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Deleted Table {TableId}", tableId);
    }

    public async Task UpdatePositionsAsync(
        UpdateTablePositionsRequestModel request, CancellationToken ct = default)
    {
        foreach (var item in request.Items)
        {
            var entity = await _unitOfWork.Tables.GetByIdAsync(item.TableId, ct)
                ?? throw new EntityNotFoundException("Table", item.TableId);

            entity.PositionX = item.PositionX;
            entity.PositionY = item.PositionY;
            _unitOfWork.Tables.Update(entity);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated positions for {Count} tables", request.Items.Count);
    }

    public async Task<TableResponseModel> OpenTableAsync(
        int tableId, OpenTableRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status != ETableStatus.Available && entity.Status != ETableStatus.Reserved)
            throw new BusinessException("โต๊ะนี้ไม่พร้อมเปิด");

        if (!Enum.TryParse<EGuestType>(request.GuestType, true, out var guestType))
            throw new ValidationException("ประเภทลูกค้าไม่ถูกต้อง");

        entity.Status = ETableStatus.Occupied;
        entity.CurrentGuests = request.GuestCount;
        entity.GuestType = guestType;
        entity.OpenedAt = DateTime.UtcNow;
        entity.Note = request.Note;

        // Generate QR Token + Short Code
        var nonce = GenerateNonce();
        entity.QrTokenNonce = nonce;
        entity.QrToken = GenerateQrToken(tableId, nonce);
        entity.QrTokenExpiresAt = DateTime.UtcNow.AddHours(12);
        entity.QrShortCode = await GenerateUniqueShortCodeAsync(ct);

        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        // Auto-create Order for this table
        var order = new TbOrder
        {
            TableId = tableId,
            OrderNumber = await GenerateOrderNumberAsync(ct),
            Status = EOrderStatus.Open,
            GuestCount = request.GuestCount,
            SubTotal = 0
        };

        await _unitOfWork.Orders.AddAsync(order, ct);
        await _unitOfWork.CommitAsync(ct);

        entity.ActiveOrderId = order.OrderId;
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        // Auto Check-In reservation
        if (request.ReservationId.HasValue)
        {
            var reservation = await _unitOfWork.Reservations.GetByIdAsync(request.ReservationId.Value, ct)
                ?? throw new EntityNotFoundException("Reservation", request.ReservationId.Value);

            if (reservation.Status != EReservationStatus.Pending)
                throw new BusinessException("การจองนี้ไม่สามารถ Check-in ได้");

            reservation.Status = EReservationStatus.CheckedIn;
            reservation.TableId = tableId;
            _unitOfWork.Reservations.Update(reservation);
            await _unitOfWork.CommitAsync(ct);
        }

        _logger.LogInformation("Opened Table {TableId} GuestType={GuestType} Guests={GuestCount} OrderNumber={OrderNumber}",
            tableId, guestType, request.GuestCount, order.OrderNumber);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Occupied.ToString(), ct);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task<TableResponseModel> CloseTableAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status != ETableStatus.Occupied && entity.Status != ETableStatus.Billing)
            throw new BusinessException("โต๊ะนี้ไม่สามารถปิดได้");

        var hasLinkClose = await _unitOfWork.TableLinks.QueryNoTracking()
            .AnyAsync(tl => tl.TableId == tableId, ct);
        if (hasLinkClose)
            throw new BusinessException("ไม่สามารถปิดโต๊ะที่เชื่อมอยู่ — กรุณายกเลิกการเชื่อมก่อน");

        // ตรวจสอบว่า Order มี item ที่ส่งครัวแล้วหรือไม่
        if (entity.ActiveOrderId.HasValue)
        {
            var orderId = entity.ActiveOrderId.Value;

            var blockedStatuses = new[]
            {
                EOrderItemStatus.Sent,
                EOrderItemStatus.Preparing,
                EOrderItemStatus.Ready,
                EOrderItemStatus.Served
            };

            var hasKitchenItems = await _unitOfWork.OrderItems.QueryNoTracking()
                .AnyAsync(i => i.OrderId == orderId
                    && blockedStatuses.Contains(i.Status), ct);

            if (hasKitchenItems)
                throw new BusinessException("ไม่สามารถปิดโต๊ะได้ เนื่องจากมีรายการที่ส่งครัวแล้ว");

            // Clear FK ก่อน delete Order
            entity.ActiveOrderId = null;
            _unitOfWork.Tables.Update(entity);
            await _unitOfWork.CommitAsync(ct);

            // Hard delete: OrderItems (cascade ลบ OrderItemOptions) → OrderBills → Order
            var orderItems = await _unitOfWork.OrderItems.GetAll()
                .Where(i => i.OrderId == orderId)
                .ToListAsync(ct);
            if (orderItems.Count > 0)
                _unitOfWork.OrderItems.DeleteRange(orderItems);

            var orderBills = await _unitOfWork.OrderBills.GetAll()
                .Where(b => b.OrderId == orderId)
                .ToListAsync(ct);
            if (orderBills.Count > 0)
                _unitOfWork.OrderBills.DeleteRange(orderBills);

            var order = await _unitOfWork.Orders.GetByIdAsync(orderId, ct);
            if (order != null)
                _unitOfWork.Orders.Delete(order);
        }

        // เปลี่ยนเป็น Available โดยตรง (ข้าม Cleaning)
        entity.Status = ETableStatus.Available;
        entity.CurrentGuests = null;
        entity.GuestType = null;
        entity.OpenedAt = null;
        entity.Note = null;
        entity.QrToken = null;
        entity.QrTokenExpiresAt = null;
        entity.QrTokenNonce = null;
        entity.QrShortCode = null;
        entity.ActiveOrderId = null;

        _unitOfWork.Tables.Update(entity);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Closed Table {TableId}", tableId);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Available.ToString(), ct);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task<TableResponseModel> CleanTableAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status != ETableStatus.Cleaning)
            throw new BusinessException("โต๊ะนี้ไม่ได้อยู่ในสถานะทำความสะอาด");

        entity.Status = ETableStatus.Available;
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Cleaned Table {TableId}", tableId);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Available.ToString(), ct);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task<TableResponseModel> MoveTableAsync(
        int tableId, MoveTableRequestModel request, CancellationToken ct = default)
    {
        var source = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (source.Status != ETableStatus.Occupied)
            throw new BusinessException("โต๊ะต้นทางต้องมีลูกค้านั่งอยู่");

        var hasLinkMove = await _unitOfWork.TableLinks.QueryNoTracking()
            .AnyAsync(tl => tl.TableId == tableId, ct);
        if (hasLinkMove)
            throw new BusinessException("ไม่สามารถย้ายโต๊ะที่เชื่อมอยู่ — กรุณายกเลิกการเชื่อมก่อน");

        var target = await _unitOfWork.Tables.GetByIdAsync(request.TargetTableId, ct)
            ?? throw new EntityNotFoundException("Table", request.TargetTableId);

        if (target.Status != ETableStatus.Available)
            throw new BusinessException("โต๊ะปลายทางไม่ว่าง");

        // Transfer session data to target
        target.Status = ETableStatus.Occupied;
        target.CurrentGuests = source.CurrentGuests;
        target.GuestType = source.GuestType;
        target.OpenedAt = source.OpenedAt;
        target.Note = source.Note;
        target.ActiveOrderId = source.ActiveOrderId;

        // Generate new QR for target
        var nonce = GenerateNonce();
        target.QrTokenNonce = nonce;
        target.QrToken = GenerateQrToken(request.TargetTableId, nonce);
        target.QrTokenExpiresAt = DateTime.UtcNow.AddHours(12);
        target.QrShortCode = await GenerateUniqueShortCodeAsync(ct);

        // Update Order.TableId to point to the new table
        if (source.ActiveOrderId.HasValue)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(source.ActiveOrderId.Value, ct);
            if (order != null)
            {
                order.TableId = request.TargetTableId;
                _unitOfWork.Orders.Update(order);
            }
        }

        // Clear source → Available (skip Cleaning)
        source.Status = ETableStatus.Available;
        source.ActiveOrderId = null;
        source.CurrentGuests = null;
        source.GuestType = null;
        source.OpenedAt = null;
        source.Note = null;
        source.QrToken = null;
        source.QrTokenExpiresAt = null;
        source.QrTokenNonce = null;
        source.QrShortCode = null;

        _unitOfWork.Tables.Update(source);
        _unitOfWork.Tables.Update(target);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Moved Table {SourceTableId} → {TargetTableId}", tableId, request.TargetTableId);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Available.ToString(), ct);
        await _notificationService.NotifyTableStatusChangedAsync(request.TargetTableId, ETableStatus.Occupied.ToString(), ct);

        return await GetTableByIdAsync(request.TargetTableId, ct);
    }

    public async Task LinkTablesAsync(LinkTablesRequestModel request, CancellationToken ct = default)
    {
        if (request.TableIds.Count < 2)
            throw new ValidationException("ต้องเลือกอย่างน้อย 2 โต๊ะ");

        // Validate all tables
        var tables = new List<TbTable>();
        foreach (var tid in request.TableIds)
        {
            var table = await _unitOfWork.Tables.GetByIdAsync(tid, ct)
                ?? throw new EntityNotFoundException("Table", tid);

            if (table.Status != ETableStatus.Occupied)
                throw new BusinessException($"โต๊ะ {table.TableName} ต้องมีลูกค้านั่งอยู่");

            if (!table.ActiveOrderId.HasValue)
                throw new BusinessException($"โต๊ะ {table.TableName} ไม่มีออเดอร์ที่เปิดอยู่");

            var existingLink = await _unitOfWork.TableLinks.QueryNoTracking()
                .AnyAsync(tl => tl.TableId == tid, ct);
            if (existingLink)
                throw new BusinessException($"โต๊ะ {table.TableName} เชื่อมกับกลุ่มอื่นอยู่แล้ว");

            tables.Add(table);
        }

        // Validate all tables are in the same zone
        var zoneIds = tables.Select(t => t.ZoneId).Distinct().ToList();
        if (zoneIds.Count > 1)
            throw new ValidationException("สามารถเชื่อมโต๊ะได้เฉพาะภายในโซนเดียวกันเท่านั้น");

        // Validate all orders are Open
        foreach (var table in tables)
        {
            var order = await _unitOfWork.Orders.QueryNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == table.ActiveOrderId!.Value, ct);
            if (order == null || order.Status != EOrderStatus.Open)
                throw new BusinessException($"โต๊ะ {table.TableName} ออเดอร์ไม่ได้อยู่ในสถานะเปิด");
        }

        var primaryTable = tables[0];
        var primaryOrderId = primaryTable.ActiveOrderId!.Value;

        // Set SourceTableId for existing items in primary order
        var existingItems = await _unitOfWork.OrderItems.GetAll()
            .Where(i => i.OrderId == primaryOrderId && i.SourceTableId == null)
            .ToListAsync(ct);
        foreach (var item in existingItems)
        {
            item.SourceTableId = primaryTable.TableId;
            _unitOfWork.OrderItems.Update(item);
        }

        // Phase 1: Move items + clear FK references
        var secondaryOrderIds = new List<int>();
        for (var i = 1; i < tables.Count; i++)
        {
            var secondaryTable = tables[i];
            var secondaryOrderId = secondaryTable.ActiveOrderId!.Value;
            secondaryOrderIds.Add(secondaryOrderId);

            // Move ALL items (including soft-deleted) to primary order
            var secondaryItems = await _unitOfWork.OrderItems.GetAll()
                .IgnoreQueryFilters()
                .Where(it => it.OrderId == secondaryOrderId)
                .ToListAsync(ct);
            foreach (var item in secondaryItems)
            {
                item.OrderId = primaryOrderId;
                item.SourceTableId = secondaryTable.TableId;
                _unitOfWork.OrderItems.Update(item);
            }

            // Point secondary table to primary order
            secondaryTable.ActiveOrderId = primaryOrderId;
            _unitOfWork.Tables.Update(secondaryTable);

            // Clear FK in notifications
            var relatedNotifications = await _unitOfWork.Notifications.GetAll()
                .IgnoreQueryFilters()
                .Where(n => n.OrderId == secondaryOrderId)
                .ToListAsync(ct);
            foreach (var noti in relatedNotifications)
            {
                noti.OrderId = null;
                _unitOfWork.Notifications.Update(noti);
            }

            // Delete bills
            var secondaryBills = await _unitOfWork.OrderBills.GetAll()
                .IgnoreQueryFilters()
                .Where(b => b.OrderId == secondaryOrderId)
                .ToListAsync(ct);
            if (secondaryBills.Count > 0)
                _unitOfWork.OrderBills.DeleteRange(secondaryBills);
        }

        // Commit phase 1 — all FK references cleared
        await _unitOfWork.CommitAsync(ct);

        // Phase 2: Hard-delete secondary orders (FK ถูก clear แล้ว)
        foreach (var secOrderId in secondaryOrderIds)
        {
            var secOrder = await _unitOfWork.Orders.GetAll()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.OrderId == secOrderId, ct);
            if (secOrder != null)
                _unitOfWork.Orders.Delete(secOrder);
        }

        // Recalculate primary order SubTotal
        var primaryOrder = await _unitOfWork.Orders.GetByIdAsync(primaryOrderId, ct)!;
        var allItems = await _unitOfWork.OrderItems.QueryNoTracking()
            .Where(it => it.OrderId == primaryOrderId
                && it.Status != EOrderItemStatus.Voided
                && it.Status != EOrderItemStatus.Cancelled)
            .ToListAsync(ct);
        primaryOrder!.SubTotal = allItems.Sum(it => it.TotalPrice);
        _unitOfWork.Orders.Update(primaryOrder);

        // Create TbTableLink records
        var groupCode = Guid.NewGuid().ToString("N")[..8];
        for (var i = 0; i < tables.Count; i++)
        {
            await _unitOfWork.TableLinks.AddAsync(new TbTableLink
            {
                GroupCode = groupCode,
                TableId = tables[i].TableId,
                IsPrimary = i == 0
            }, ct);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Linked tables {TableIds} with GroupCode={GroupCode}, PrimaryOrderId={OrderId}",
            string.Join(",", request.TableIds), groupCode, primaryOrderId);

        // Notify all tables
        foreach (var table in tables)
            await _notificationService.NotifyTableStatusChangedAsync(table.TableId, ETableStatus.Occupied.ToString(), ct);
    }

    public async Task UnlinkTablesAsync(string groupCode, CancellationToken ct = default)
    {
        var links = await _unitOfWork.TableLinks.GetAll()
            .Where(tl => tl.GroupCode == groupCode)
            .ToListAsync(ct);

        if (links.Count == 0)
            throw new EntityNotFoundException("TableLink group", groupCode);

        // Find primary
        var primaryLink = links.FirstOrDefault(l => l.IsPrimary)
            ?? throw new BusinessException("ไม่พบโต๊ะหลักในกลุ่ม");

        var primaryTable = await _unitOfWork.Tables.GetByIdAsync(primaryLink.TableId, ct)
            ?? throw new EntityNotFoundException("Table", primaryLink.TableId);

        var secondaryLinks = links.Where(l => !l.IsPrimary).ToList();

        // Split items back only if primary order exists and is Open
        TbOrder? primaryOrder = primaryTable.ActiveOrderId.HasValue
            ? await _unitOfWork.Orders.GetByIdAsync(primaryTable.ActiveOrderId.Value, ct)
            : null;

        if (primaryOrder != null && primaryOrder.Status == EOrderStatus.Open)
        {
            foreach (var secLink in secondaryLinks)
            {
                var secTable = await _unitOfWork.Tables.GetByIdAsync(secLink.TableId, ct)!;

                var secItems = await _unitOfWork.OrderItems.GetAll()
                    .Where(i => i.OrderId == primaryOrder.OrderId && i.SourceTableId == secLink.TableId)
                    .ToListAsync(ct);

                if (secItems.Count > 0)
                {
                    var newOrder = new TbOrder
                    {
                        TableId = secLink.TableId,
                        OrderNumber = await GenerateOrderNumberAsync(ct),
                        Status = EOrderStatus.Open,
                        GuestCount = secTable!.CurrentGuests ?? 0,
                        SubTotal = secItems
                            .Where(i => i.Status != EOrderItemStatus.Voided && i.Status != EOrderItemStatus.Cancelled)
                            .Sum(i => i.TotalPrice)
                    };
                    await _unitOfWork.Orders.AddAsync(newOrder, ct);
                    await _unitOfWork.CommitAsync(ct);

                    foreach (var item in secItems)
                    {
                        item.OrderId = newOrder.OrderId;
                        item.SourceTableId = null;
                        _unitOfWork.OrderItems.Update(item);
                    }

                    secTable!.ActiveOrderId = newOrder.OrderId;
                }
                else
                {
                    // ไม่มี item ให้แยก → ล้าง ActiveOrderId ของโต๊ะรอง
                    secTable!.ActiveOrderId = null;
                }

                _unitOfWork.Tables.Update(secTable);
            }

            // Clear SourceTableId on primary items
            var primaryItems = await _unitOfWork.OrderItems.GetAll()
                .Where(i => i.OrderId == primaryOrder.OrderId)
                .ToListAsync(ct);
            foreach (var item in primaryItems)
            {
                item.SourceTableId = null;
                _unitOfWork.OrderItems.Update(item);
            }

            primaryOrder.SubTotal = primaryItems
                .Where(i => i.Status != EOrderItemStatus.Voided && i.Status != EOrderItemStatus.Cancelled)
                .Sum(i => i.TotalPrice);
            _unitOfWork.Orders.Update(primaryOrder);
        }
        else
        {
            // ไม่มี order หรือ order ไม่ได้เปิด → ล้าง ActiveOrderId โต๊ะรองทั้งหมด
            foreach (var secLink in secondaryLinks)
            {
                var secTable = await _unitOfWork.Tables.GetByIdAsync(secLink.TableId, ct);
                if (secTable != null)
                {
                    secTable.ActiveOrderId = null;
                    _unitOfWork.Tables.Update(secTable);
                }
            }
        }

        // Delete TbTableLink records
        _unitOfWork.TableLinks.DeleteRange(links);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Unlinked tables GroupCode={GroupCode}", groupCode);

        // Notify all tables
        var allTableIds = links.Select(l => l.TableId).ToList();
        foreach (var tid in allTableIds)
            await _notificationService.NotifyTableStatusChangedAsync(tid, ETableStatus.Occupied.ToString(), ct);
    }

    public async Task UnlinkSingleTableAsync(int tableId, CancellationToken ct = default)
    {
        // 1. Find the table's link record
        var link = await _unitOfWork.TableLinks.GetAll()
            .FirstOrDefaultAsync(tl => tl.TableId == tableId, ct)
            ?? throw new BusinessException("โต๊ะนี้ไม่ได้อยู่ในกลุ่มเชื่อมต่อ");

        if (link.IsPrimary)
            throw new BusinessException("โต๊ะหลักไม่สามารถแยกตัวเองได้ ต้องยกเลิกเชื่อมทั้งกลุ่ม");

        var groupCode = link.GroupCode;

        // 2. Find primary table + order
        var primaryLink = await _unitOfWork.TableLinks.QueryNoTracking()
            .FirstOrDefaultAsync(tl => tl.GroupCode == groupCode && tl.IsPrimary, ct)
            ?? throw new BusinessException("ไม่พบโต๊ะหลักในกลุ่ม");

        var primaryTable = await _unitOfWork.Tables.GetByIdAsync(primaryLink.TableId, ct)!;
        var secTable = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)!;

        // 3. Split items back if primary order is Open
        if (primaryTable!.ActiveOrderId.HasValue)
        {
            var primaryOrder = await _unitOfWork.Orders.GetByIdAsync(primaryTable.ActiveOrderId.Value, ct);
            if (primaryOrder != null && primaryOrder.Status == EOrderStatus.Open)
            {
                var secItems = await _unitOfWork.OrderItems.GetAll()
                    .Where(i => i.OrderId == primaryOrder.OrderId && i.SourceTableId == tableId)
                    .ToListAsync(ct);

                if (secItems.Count > 0)
                {
                    var newOrder = new TbOrder
                    {
                        TableId = tableId,
                        OrderNumber = await GenerateOrderNumberAsync(ct),
                        Status = EOrderStatus.Open,
                        GuestCount = secTable!.CurrentGuests ?? 0,
                        SubTotal = secItems
                            .Where(i => i.Status != EOrderItemStatus.Voided && i.Status != EOrderItemStatus.Cancelled)
                            .Sum(i => i.TotalPrice)
                    };
                    await _unitOfWork.Orders.AddAsync(newOrder, ct);
                    await _unitOfWork.CommitAsync(ct);

                    foreach (var item in secItems)
                    {
                        item.OrderId = newOrder.OrderId;
                        item.SourceTableId = null;
                        _unitOfWork.OrderItems.Update(item);
                    }

                    secTable!.ActiveOrderId = newOrder.OrderId;
                }
                else
                {
                    secTable!.ActiveOrderId = null;
                }

                // Recalculate primary order subtotal
                var remainingItems = await _unitOfWork.OrderItems.GetAll()
                    .Where(i => i.OrderId == primaryOrder.OrderId)
                    .ToListAsync(ct);
                primaryOrder.SubTotal = remainingItems
                    .Where(i => i.Status != EOrderItemStatus.Voided && i.Status != EOrderItemStatus.Cancelled)
                    .Sum(i => i.TotalPrice);
                _unitOfWork.Orders.Update(primaryOrder);
            }
            else
            {
                secTable!.ActiveOrderId = null;
            }
        }
        else
        {
            secTable!.ActiveOrderId = null;
        }

        _unitOfWork.Tables.Update(secTable);

        // 4. Delete this table's link record
        _unitOfWork.TableLinks.Delete(link);

        // 5. Check if only primary remains → auto unlink the whole group
        var remainingSecondaries = await _unitOfWork.TableLinks.GetAll()
            .CountAsync(tl => tl.GroupCode == groupCode && !tl.IsPrimary && tl.TableId != tableId, ct);

        var notifyTableIds = new List<int> { tableId, primaryLink.TableId };

        if (remainingSecondaries == 0)
        {
            // Only primary left → remove primary link too + clear SourceTableId
            var primaryLinkEntity = await _unitOfWork.TableLinks.GetAll()
                .FirstOrDefaultAsync(tl => tl.GroupCode == groupCode && tl.IsPrimary, ct);
            if (primaryLinkEntity != null)
                _unitOfWork.TableLinks.Delete(primaryLinkEntity);

            if (primaryTable.ActiveOrderId.HasValue)
            {
                var primaryItems = await _unitOfWork.OrderItems.GetAll()
                    .Where(i => i.OrderId == primaryTable.ActiveOrderId.Value)
                    .ToListAsync(ct);
                foreach (var item in primaryItems)
                {
                    item.SourceTableId = null;
                    _unitOfWork.OrderItems.Update(item);
                }
            }
        }
        else
        {
            // Notify remaining secondary tables too
            var remainingLinks = await _unitOfWork.TableLinks.QueryNoTracking()
                .Where(tl => tl.GroupCode == groupCode && tl.TableId != tableId)
                .Select(tl => tl.TableId)
                .ToListAsync(ct);
            notifyTableIds.AddRange(remainingLinks);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Unlinked single table {TableId} from group {GroupCode}", tableId, groupCode);

        foreach (var tid in notifyTableIds.Distinct())
            await _notificationService.NotifyTableStatusChangedAsync(tid, ETableStatus.Occupied.ToString(), ct);
    }

    public async Task<TableResponseModel> SetUnavailableAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status != ETableStatus.Available)
            throw new BusinessException("ปิดใช้งานได้เฉพาะโต๊ะที่ว่างเท่านั้น");

        entity.Status = ETableStatus.Unavailable;
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Set Table {TableId} Unavailable", tableId);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Unavailable.ToString(), ct);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task<TableResponseModel> SetAvailableAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.GetByIdAsync(tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        if (entity.Status != ETableStatus.Unavailable)
            throw new BusinessException("เปิดใช้งานได้เฉพาะโต๊ะที่ปิดใช้งานเท่านั้น");

        entity.Status = ETableStatus.Available;
        _unitOfWork.Tables.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Set Table {TableId} Available", tableId);

        await _notificationService.NotifyTableStatusChangedAsync(tableId, ETableStatus.Available.ToString(), ct);

        return await GetTableByIdAsync(tableId, ct);
    }

    public async Task<string?> GetQrTokenAsync(int tableId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Tables.QueryNoTracking()
            .FirstOrDefaultAsync(t => t.TableId == tableId, ct)
            ?? throw new EntityNotFoundException("Table", tableId);

        return entity.QrToken;
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

        return $"{prefix}{nextNumber:D4}";
    }

    private string GenerateNonce()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(24));
    }

    private string GenerateQrToken(int tableId, string nonce)
    {
        var secret = _configuration["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("tableId", tableId.ToString()),
            new Claim("nonce", nonce),
            new Claim("type", "qr")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "RBMS.POS.API",
            audience: "RBMS.POS.QR",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateUniqueShortCodeAsync(CancellationToken ct)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const int length = 8;

        for (var attempt = 0; attempt < 10; attempt++)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);
            var code = new string(bytes.Select(b => chars[b % chars.Length]).ToArray());

            var exists = await _unitOfWork.Tables.QueryNoTracking()
                .AnyAsync(t => t.QrShortCode == code, ct);

            if (!exists)
                return code;
        }

        throw new BusinessException("ไม่สามารถสร้าง QR Short Code ได้ กรุณาลองใหม่");
    }
}
