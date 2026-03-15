namespace POS.Main.Dal.Entities;

public class TbPasswordHistory
{
    public int PasswordHistoryId { get; set; }

    public Guid UserId { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // Navigation
    public virtual TbUser User { get; set; } = null!;
}
