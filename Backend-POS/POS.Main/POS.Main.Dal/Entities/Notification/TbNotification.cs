namespace POS.Main.Dal.Entities;

public class TbNotification
{
    public int NotificationId { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public int? TableId { get; set; }
    public virtual TbTable? Table { get; set; }

    public int? OrderId { get; set; }
    public virtual TbOrder? Order { get; set; }

    public int? ReservationId { get; set; }
    public virtual TbReservation? Reservation { get; set; }

    public string TargetGroup { get; set; } = string.Empty;

    public string? Payload { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<TbNotificationRead> NotificationReads { get; set; } = new List<TbNotificationRead>();
}
