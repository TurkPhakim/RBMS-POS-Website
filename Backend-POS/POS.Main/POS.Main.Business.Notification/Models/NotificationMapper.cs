using POS.Main.Dal.Entities;

namespace POS.Main.Business.Notification.Models;

public static class NotificationMapper
{
    public static TbNotification ToEntity(SendNotificationModel model)
    {
        return new TbNotification
        {
            EventType = model.EventType,
            Title = model.Title,
            Message = model.Message,
            TableId = model.TableId,
            OrderId = model.OrderId,
            ReservationId = model.ReservationId,
            TargetGroup = model.TargetGroup,
            Payload = model.Payload,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static NotificationResponseModel ToResponse(TbNotification entity, bool isRead)
    {
        return new NotificationResponseModel
        {
            NotificationId = entity.NotificationId,
            EventType = entity.EventType,
            Title = entity.Title,
            Message = entity.Message,
            TableId = entity.TableId,
            TableName = entity.Table?.TableName,
            ZoneName = entity.Table?.Zone?.ZoneName,
            OrderId = entity.OrderId,
            ReservationId = entity.ReservationId,
            TargetGroup = entity.TargetGroup,
            Payload = entity.Payload,
            CreatedAt = entity.CreatedAt,
            IsRead = isRead
        };
    }
}
