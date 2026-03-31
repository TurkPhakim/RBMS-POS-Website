using Microsoft.EntityFrameworkCore;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Core.Helpers;
using POS.Main.Dal;

namespace RBMS.POS.WebAPI.Services;

public class CleanupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CleanupBackgroundService> _logger;
    private static readonly TimeSpan TokenCleanupInterval = TimeSpan.FromHours(6);
    private static readonly TimeSpan NotificationMaxAge = TimeSpan.FromDays(7);
    private static readonly TimeSpan SlipFileMaxAge = TimeSpan.FromDays(7);

    public CleanupBackgroundService(IServiceProvider serviceProvider, ILogger<CleanupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CleanupBackgroundService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredTokensAsync(stoppingToken);
                await CleanupOldNotificationsAsync(stoppingToken);
                await CleanupOldSlipFilesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup");
            }

            await Task.Delay(TokenCleanupInterval, stoppingToken);
        }
    }

    private async Task CleanupExpiredTokensAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<POSMainContext>();

        var now = DateTime.UtcNow;
        var expiredTokens = await db.RefreshTokens
            .Where(t => t.ExpiresAt < now || t.IsRevoked)
            .ToListAsync(ct);

        if (expiredTokens.Count > 0)
        {
            db.RefreshTokens.RemoveRange(expiredTokens);
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens", expiredTokens.Count);
        }
    }

    private async Task CleanupOldNotificationsAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<POSMainContext>();

        var cutoff = DateTimeHelper.BangkokNow().Subtract(NotificationMaxAge);

        // Delete reads first (FK constraint)
        var oldReads = await db.NotificationReads
            .Where(nr => db.Notifications
                .Where(n => n.CreatedAt < cutoff)
                .Select(n => n.NotificationId)
                .Contains(nr.NotificationId))
            .ToListAsync(ct);

        if (oldReads.Count > 0)
        {
            db.NotificationReads.RemoveRange(oldReads);
            await db.SaveChangesAsync(ct);
        }

        var oldNotifications = await db.Notifications
            .Where(n => n.CreatedAt < cutoff)
            .ToListAsync(ct);

        if (oldNotifications.Count > 0)
        {
            db.Notifications.RemoveRange(oldNotifications);
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Cleaned up {Count} old notifications", oldNotifications.Count);
        }
    }

    private async Task CleanupOldSlipFilesAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<POSMainContext>();
        var s3 = scope.ServiceProvider.GetRequiredService<IS3StorageService>();

        var cutoff = DateTimeHelper.BangkokNow().Subtract(SlipFileMaxAge);

        // Find slip file IDs from old payments
        var oldSlipFileIds = await db.Payments
            .Where(p => p.SlipImageFileId != null && p.PaidAt < cutoff)
            .Select(p => p.SlipImageFileId!.Value)
            .Distinct()
            .ToListAsync(ct);

        // Also find customer slip file IDs from old bills
        var oldCustomerSlipFileIds = await db.OrderBills
            .Where(b => b.CustomerSlipFileId != null && b.PaidAt != null && b.PaidAt < cutoff)
            .Select(b => b.CustomerSlipFileId!.Value)
            .Distinct()
            .ToListAsync(ct);

        var allFileIds = oldSlipFileIds.Union(oldCustomerSlipFileIds).Distinct().ToList();
        if (allFileIds.Count == 0) return;

        // Null out FK references first
        var paymentsToUpdate = await db.Payments
            .Where(p => p.SlipImageFileId != null && allFileIds.Contains(p.SlipImageFileId.Value))
            .ToListAsync(ct);
        foreach (var p in paymentsToUpdate)
            p.SlipImageFileId = null;

        var billsToUpdate = await db.OrderBills
            .Where(b => b.CustomerSlipFileId != null && allFileIds.Contains(b.CustomerSlipFileId.Value))
            .ToListAsync(ct);
        foreach (var b in billsToUpdate)
            b.CustomerSlipFileId = null;

        await db.SaveChangesAsync(ct);

        // Get file records for S3 keys
        var files = await db.Files
            .Where(f => allFileIds.Contains(f.FileId))
            .ToListAsync(ct);

        // Delete from S3 + hard-delete from DB
        foreach (var file in files)
        {
            try
            {
                await s3.DeleteAsync(file.S3Key, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete S3 object {S3Key}", file.S3Key);
            }
        }

        db.Files.RemoveRange(files);
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("Cleaned up {Count} old slip files", files.Count);
    }
}
