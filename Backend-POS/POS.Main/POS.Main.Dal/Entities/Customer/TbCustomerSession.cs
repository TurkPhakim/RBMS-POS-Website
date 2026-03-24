namespace POS.Main.Dal.Entities;

public class TbCustomerSession
{
    public int CustomerSessionId { get; set; }

    public int TableId { get; set; }
    public virtual TbTable Table { get; set; } = null!;

    public string SessionToken { get; set; } = string.Empty;

    public string? Nickname { get; set; }

    public string? DeviceFingerprint { get; set; }

    public string QrTokenNonce { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }
}
