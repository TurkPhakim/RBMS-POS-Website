namespace POS.Main.Dal.Entities;

public class TbRefreshToken
{
    public Guid RefreshTokenId { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; } = false;

    public DateTime? RevokedAt { get; set; }

    public string? RevokedByIp { get; set; }

    public string? CreatedByIp { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation Property
    public virtual TbUser User { get; set; } = null!;

    // Helper Properties
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    public bool IsActive => !IsRevoked && !IsExpired;
}
