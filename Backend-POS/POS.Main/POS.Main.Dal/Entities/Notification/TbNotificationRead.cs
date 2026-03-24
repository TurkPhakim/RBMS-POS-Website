namespace POS.Main.Dal.Entities;

public class TbNotificationRead
{
    public int NotificationReadId { get; set; }

    public int NotificationId { get; set; }
    public virtual TbNotification Notification { get; set; } = null!;

    public Guid UserId { get; set; }
    public virtual TbUser User { get; set; } = null!;

    public DateTime? ReadAt { get; set; }

    public DateTime? ClearedAt { get; set; }
}
