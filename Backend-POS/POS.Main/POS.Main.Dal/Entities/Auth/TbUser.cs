namespace POS.Main.Dal.Entities;

public class TbUser : BaseEntity
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public int FailedLoginAttempts { get; set; } = 0;

    public int LockoutCount { get; set; } = 0;

    public DateTime? LockedUntil { get; set; }

    public DateTime? LastLoginDate { get; set; }

    public DateTime? LastPasswordChangedDate { get; set; }

    // Navigation Properties (1:1 with Employee)
    public virtual TbEmployee? Employee { get; set; }

    public virtual ICollection<TbRefreshToken> RefreshTokens { get; set; } = new List<TbRefreshToken>();

}
