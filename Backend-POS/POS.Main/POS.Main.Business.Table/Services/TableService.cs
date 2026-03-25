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
            .OrderBy(t => t.Zone.SortOrder)
            .ThenBy(t => t.TableName)
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
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(ct);

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
        List<string>? linkedTableNames = null;

        if (linkedGroupCode != null)
        {
            linkedTableNames = await _unitOfWork.TableLinks.QueryNoTracking()
                .Where(tl => tl.GroupCode == linkedGroupCode && tl.TableId != tableId)
                .Join(_unitOfWork.Tables.QueryNoTracking(), tl => tl.TableId, t => t.TableId, (tl, t) => t.TableName)
                .ToListAsync(ct);
        }

        return TableMapper.ToResponse(entity, linkedGroupCode, linkedTableNames);
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

        // Generate QR Token
        var nonce = GenerateNonce();
        entity.QrTokenNonce = nonce;
        entity.QrToken = GenerateQrToken(tableId, nonce);
        entity.QrTokenExpiresAt = DateTime.UtcNow.AddHours(12);

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

        // Merge secondary orders into primary
        for (var i = 1; i < tables.Count; i++)
        {
            var secondaryTable = tables[i];
            var secondaryOrderId = secondaryTable.ActiveOrderId!.Value;

            // Move items to primary order
            var secondaryItems = await _unitOfWork.OrderItems.GetAll()
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

            // Delete secondary order's bills and order
            var secondaryBills = await _unitOfWork.OrderBills.GetAll()
                .Where(b => b.OrderId == secondaryOrderId)
                .ToListAsync(ct);
            if (secondaryBills.Count > 0)
                _unitOfWork.OrderBills.DeleteRange(secondaryBills);

            var secondaryOrder = await _unitOfWork.Orders.GetByIdAsync(secondaryOrderId, ct);
            if (secondaryOrder != null)
                _unitOfWork.Orders.Delete(secondaryOrder);
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

        if (!primaryTable.ActiveOrderId.HasValue)
            throw new BusinessException("ไม่พบออเดอร์ที่เปิดอยู่");

        var primaryOrder = await _unitOfWork.Orders.GetByIdAsync(primaryTable.ActiveOrderId.Value, ct)
            ?? throw new EntityNotFoundException("Order", primaryTable.ActiveOrderId.Value);

        if (primaryOrder.Status != EOrderStatus.Open)
            throw new BusinessException("ไม่สามารถยกเลิกเชื่อมได้ — ออเดอร์ต้องอยู่ในสถานะเปิด (ถ้ากำลังรอชำระ ให้ยกเลิกบิลก่อน)");

        var secondaryLinks = links.Where(l => !l.IsPrimary).ToList();

        // Split items back to secondary tables
        foreach (var secLink in secondaryLinks)
        {
            var secTable = await _unitOfWork.Tables.GetByIdAsync(secLink.TableId, ct)!;

            // Find items belonging to this secondary table
            var secItems = await _unitOfWork.OrderItems.GetAll()
                .Where(i => i.OrderId == primaryOrder.OrderId && i.SourceTableId == secLink.TableId)
                .ToListAsync(ct);

            // Create new order for secondary table
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

            // Move items to new order
            foreach (var item in secItems)
            {
                item.OrderId = newOrder.OrderId;
                item.SourceTableId = null;
                _unitOfWork.OrderItems.Update(item);
            }

            // Update secondary table
            secTable.ActiveOrderId = newOrder.OrderId;
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

        // Recalculate primary SubTotal
        primaryOrder.SubTotal = primaryItems
            .Where(i => i.Status != EOrderItemStatus.Voided && i.Status != EOrderItemStatus.Cancelled)
            .Sum(i => i.TotalPrice);
        _unitOfWork.Orders.Update(primaryOrder);

        // Delete TbTableLink records
        _unitOfWork.TableLinks.DeleteRange(links);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Unlinked tables GroupCode={GroupCode}", groupCode);

        // Notify all tables
        var allTableIds = links.Select(l => l.TableId).ToList();
        foreach (var tid in allTableIds)
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
}
