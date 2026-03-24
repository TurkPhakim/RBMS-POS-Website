namespace POS.Main.Business.Notification.Models;

public class SendNotificationModel
{
    public string EventType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? TableId { get; set; }
    public int? OrderId { get; set; }
    public int? ReservationId { get; set; }
    public string TargetGroup { get; set; } = string.Empty;
    public string? Payload { get; set; }
}
