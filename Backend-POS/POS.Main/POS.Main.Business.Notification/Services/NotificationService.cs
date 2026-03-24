using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Notification.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IUnitOfWork unitOfWork, ILogger<NotificationService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<NotificationResponseModel> SendAsync(SendNotificationModel model, CancellationToken ct = default)
    {
        var entity = NotificationMapper.ToEntity(model);

        await _unitOfWork.Notifications.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Notification sent: {EventType} → {TargetGroup}", model.EventType, model.TargetGroup);

        // Reload with Table → Zone so SignalR response includes tableName/zoneName
        if (entity.TableId.HasValue)
        {
            var reloaded = await _unitOfWork.Notifications
                .QueryNoTracking()
                .Include(n => n.Table)
                    .ThenInclude(t => t!.Zone)
                .FirstAsync(n => n.NotificationId == entity.NotificationId, ct);
            return NotificationMapper.ToResponse(reloaded, false);
        }

        return NotificationMapper.ToResponse(entity, false);
    }

    public async Task<List<NotificationResponseModel>> GetNotificationsAsync(
        Guid userId, string? eventType, int? tableId, int limit, int? before, CancellationToken ct = default)
    {
        var userGroups = await GetUserGroupsAsync(userId, ct);

        var clearedAt = await _unitOfWork.NotificationReads
            .QueryNoTracking()
            .Where(nr => nr.UserId == userId && nr.ClearedAt != null)
            .MaxAsync(nr => (DateTime?)nr.ClearedAt, ct);

        var query = _unitOfWork.Notifications
            .QueryNoTracking()
            .Include(n => n.Table)
                .ThenInclude(t => t!.Zone)
            .Include(n => n.NotificationReads.Where(nr => nr.UserId == userId))
            .Where(n => userGroups.Contains(n.TargetGroup));

        if (clearedAt.HasValue)
        {
            query = query.Where(n => n.CreatedAt > clearedAt.Value);
        }

        if (!string.IsNullOrEmpty(eventType))
        {
            query = query.Where(n => n.EventType == eventType);
        }

        if (tableId.HasValue)
        {
            query = query.Where(n => n.TableId == tableId.Value);
        }

        if (before.HasValue)
        {
            query = query.Where(n => n.NotificationId < before.Value);
        }

        var notifications = await query
            .OrderByDescending(n => n.NotificationId)
            .Take(limit)
            .ToListAsync(ct);

        return notifications.Select(n =>
        {
            var readRecord = n.NotificationReads.FirstOrDefault();
            var isRead = readRecord?.ReadAt != null;
            return NotificationMapper.ToResponse(n, isRead);
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct = default)
    {
        var userGroups = await GetUserGroupsAsync(userId, ct);

        var clearedAt = await _unitOfWork.NotificationReads
            .QueryNoTracking()
            .Where(nr => nr.UserId == userId && nr.ClearedAt != null)
            .MaxAsync(nr => (DateTime?)nr.ClearedAt, ct);

        var query = _unitOfWork.Notifications
            .QueryNoTracking()
            .Where(n => userGroups.Contains(n.TargetGroup));

        if (clearedAt.HasValue)
        {
            query = query.Where(n => n.CreatedAt > clearedAt.Value);
        }

        var unreadCount = await query
            .Where(n => !n.NotificationReads.Any(nr => nr.UserId == userId && nr.ReadAt != null))
            .CountAsync(ct);

        return unreadCount;
    }

    public async Task MarkReadAsync(int notificationId, Guid userId, CancellationToken ct = default)
    {
        var existing = await _unitOfWork.NotificationReads
            .GetAll()
            .FirstOrDefaultAsync(nr => nr.NotificationId == notificationId && nr.UserId == userId, ct);

        if (existing != null)
        {
            existing.ReadAt = DateTime.UtcNow;
        }
        else
        {
            await _unitOfWork.NotificationReads.AddAsync(new TbNotificationRead
            {
                NotificationId = notificationId,
                UserId = userId,
                ReadAt = DateTime.UtcNow
            }, ct);
        }

        await _unitOfWork.CommitAsync(ct);
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken ct = default)
    {
        var userGroups = await GetUserGroupsAsync(userId, ct);

        var unreadNotificationIds = await _unitOfWork.Notifications
            .QueryNoTracking()
            .Where(n => userGroups.Contains(n.TargetGroup))
            .Where(n => !n.NotificationReads.Any(nr => nr.UserId == userId && nr.ReadAt != null))
            .Select(n => n.NotificationId)
            .ToListAsync(ct);

        foreach (var notificationId in unreadNotificationIds)
        {
            var existing = await _unitOfWork.NotificationReads
                .GetAll()
                .FirstOrDefaultAsync(nr => nr.NotificationId == notificationId && nr.UserId == userId, ct);

            if (existing != null)
            {
                existing.ReadAt = DateTime.UtcNow;
            }
            else
            {
                await _unitOfWork.NotificationReads.AddAsync(new TbNotificationRead
                {
                    NotificationId = notificationId,
                    UserId = userId,
                    ReadAt = DateTime.UtcNow
                }, ct);
            }
        }

        await _unitOfWork.CommitAsync(ct);
    }

    public async Task ClearAllAsync(Guid userId, CancellationToken ct = default)
    {
        var existing = await _unitOfWork.NotificationReads
            .GetAll()
            .Where(nr => nr.UserId == userId)
            .OrderByDescending(nr => nr.NotificationReadId)
            .FirstOrDefaultAsync(ct);

        if (existing != null)
        {
            existing.ClearedAt = DateTime.UtcNow;
        }
        else
        {
            var latestNotificationId = await _unitOfWork.Notifications
                .QueryNoTracking()
                .OrderByDescending(n => n.NotificationId)
                .Select(n => n.NotificationId)
                .FirstOrDefaultAsync(ct);

            if (latestNotificationId > 0)
            {
                await _unitOfWork.NotificationReads.AddAsync(new TbNotificationRead
                {
                    NotificationId = latestNotificationId,
                    UserId = userId,
                    ReadAt = DateTime.UtcNow,
                    ClearedAt = DateTime.UtcNow
                }, ct);
            }
        }

        await _unitOfWork.CommitAsync(ct);
    }

    private async Task<List<string>> GetUserGroupsAsync(Guid userId, CancellationToken ct)
    {
        var user = await _unitOfWork.Users
            .QueryNoTracking()
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.UserId == userId, ct);

        if (user?.Employee?.PositionId == null) return new List<string>();

        var permissions = await _unitOfWork.AuthorizeMatrixPositions
            .QueryNoTracking()
            .Include(amp => amp.AuthorizeMatrix)
                .ThenInclude(am => am.Module)
            .Include(amp => amp.AuthorizeMatrix)
                .ThenInclude(am => am.Permission)
            .Where(amp => amp.PositionId == user.Employee.PositionId.Value)
            .Select(amp => amp.AuthorizeMatrix.Module.ModuleCode + "." + amp.AuthorizeMatrix.Permission.PermissionCode)
            .ToListAsync(ct);

        var groups = new List<string>();

        if (permissions.Any(p => p == "kitchen-food.read" || p == "kitchen-beverage.read" || p == "kitchen-dessert.read"))
            groups.Add("Kitchen");

        if (permissions.Any(p => p == "order-manage.read"))
            groups.Add("Floor");

        if (permissions.Any(p => p == "payment-manage.read"))
            groups.Add("Cashier");

        if (groups.Count >= 3 || permissions.Count > 15)
            groups = new List<string> { "Kitchen", "Floor", "Cashier", "Manager" };

        if (!groups.Contains("Manager") && permissions.Count > 10)
            groups.Add("Manager");

        return groups.Distinct().ToList();
    }
}
