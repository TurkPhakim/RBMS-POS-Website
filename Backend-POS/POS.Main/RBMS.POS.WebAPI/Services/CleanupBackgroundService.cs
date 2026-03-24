using Microsoft.EntityFrameworkCore;
using POS.Main.Dal;

namespace RBMS.POS.WebAPI.Services;

public class CleanupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CleanupBackgroundService> _logger;
    private static readonly TimeSpan TokenCleanupInterval = TimeSpan.FromHours(6);
    private static readonly TimeSpan NotificationMaxAge = TimeSpan.FromDays(7);

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

        var cutoff = DateTime.UtcNow.Subtract(NotificationMaxAge);

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
}
