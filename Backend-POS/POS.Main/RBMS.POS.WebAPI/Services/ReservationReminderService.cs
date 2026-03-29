using Microsoft.EntityFrameworkCore;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Core.Enums;
using POS.Main.Dal;

namespace RBMS.POS.WebAPI.Services;

public class ReservationReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReservationReminderService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan PendingReminderWindow = TimeSpan.FromHours(1);
    private static readonly TimeSpan ConfirmedReminderWindow = TimeSpan.FromMinutes(30);

    public ReservationReminderService(IServiceProvider serviceProvider, ILogger<ReservationReminderService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationReminderService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckUpcomingReservationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking upcoming reservations");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task CheckUpcomingReservationsAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<POSMainContext>();
        var broadcaster = scope.ServiceProvider.GetRequiredService<INotificationBroadcaster>();

        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);
        var currentTime = TimeOnly.FromDateTime(now);
        var pendingCutoff = TimeOnly.FromDateTime(now.Add(PendingReminderWindow));
        var confirmedCutoff = TimeOnly.FromDateTime(now.Add(ConfirmedReminderWindow));

        // Pending: เตือนก่อน 1 ชั่วโมง (ยังไม่ยืนยัน)
        var pendingReservations = await db.Reservations
            .Include(r => r.Table)
            .Where(r =>
                r.Status == EReservationStatus.Pending &&
                r.ReservationDate == today &&
                r.ReservationTime >= currentTime &&
                r.ReservationTime <= pendingCutoff &&
                !r.ReminderSent &&
                !r.DeleteFlag)
            .ToListAsync(ct);

        // Confirmed: เตือนก่อน 30 นาที
        var confirmedReservations = await db.Reservations
            .Include(r => r.Table)
            .Where(r =>
                r.Status == EReservationStatus.Confirmed &&
                r.ReservationDate == today &&
                r.ReservationTime >= currentTime &&
                r.ReservationTime <= confirmedCutoff &&
                !r.ReminderSent &&
                !r.DeleteFlag)
            .ToListAsync(ct);

        foreach (var reservation in pendingReservations)
        {
            await broadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "RESERVATION_REMINDER",
                Title = "การจองรอยืนยัน — ใกล้ถึงเวลา",
                Message = $"{reservation.CustomerName} — {reservation.ReservationTime:HH:mm} ({reservation.GuestCount} ท่าน) {(reservation.Table != null ? $"โต๊ะ {reservation.Table.TableName}" : "ยังไม่ระบุโต๊ะ")}",
                TableId = reservation.TableId,
                ReservationId = reservation.ReservationId,
                TargetGroup = "Floor"
            }, ct);

            reservation.ReminderSent = true;
            db.Reservations.Update(reservation);
        }

        foreach (var reservation in confirmedReservations)
        {
            await broadcaster.SendAndBroadcastAsync(new SendNotificationModel
            {
                EventType = "RESERVATION_REMINDER",
                Title = "การจองใกล้ถึงเวลา",
                Message = $"{reservation.CustomerName} — {reservation.ReservationTime:HH:mm} ({reservation.GuestCount} ท่าน) {(reservation.Table != null ? $"โต๊ะ {reservation.Table.TableName}" : "ยังไม่ระบุโต๊ะ")}",
                TableId = reservation.TableId,
                ReservationId = reservation.ReservationId,
                TargetGroup = "Floor"
            }, ct);

            reservation.ReminderSent = true;
            db.Reservations.Update(reservation);
        }

        var totalSent = pendingReservations.Count + confirmedReservations.Count;
        if (totalSent > 0)
        {
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Sent {Count} reservation reminders (Pending: {Pending}, Confirmed: {Confirmed})",
                totalSent, pendingReservations.Count, confirmedReservations.Count);
        }
    }
}
