using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Models;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Controllers;

[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ListResponseModel<NotificationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string? eventType,
        [FromQuery] int? tableId,
        [FromQuery] int limit = 30,
        [FromQuery] int? before = null,
        CancellationToken ct = default)
    {
        var userId = GetUserId();
        var result = await _notificationService.GetNotificationsAsync(userId, eventType, tableId, limit, before, ct);
        return ListSuccess(result);
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(BaseResponseModel<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct = default)
    {
        var userId = GetUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId, ct);
        return Success(count);
    }

    [HttpPatch("{notificationId}/read")]
    [ProducesResponseType(typeof(BaseResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkRead(int notificationId, CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _notificationService.MarkReadAsync(notificationId, userId, ct);
        return Success("อ่านแล้ว");
    }

    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(BaseResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _notificationService.MarkAllReadAsync(userId, ct);
        return Success("อ่านทั้งหมดแล้ว");
    }

    [HttpDelete("clear-all")]
    [ProducesResponseType(typeof(BaseResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearAll(CancellationToken ct = default)
    {
        var userId = GetUserId();
        await _notificationService.ClearAllAsync(userId, ct);
        return Success("เคลียร์แล้ว");
    }
}
