namespace POS.Main.Dal.Entities;

public class TbLoginHistory
{
    public Guid LoginHistoryId { get; set; }

    public Guid? UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public bool Success { get; set; }

    public string? FailureReason { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime LoginDate { get; set; }

    // Navigation Property
    public virtual TbUser? User { get; set; }
}
