namespace POS.Main.Dal.Entities;

public class TbPasswordResetToken
{
    public Guid PasswordResetTokenId { get; set; }

    public Guid UserId { get; set; }

    // OTP Phase
    public string OtpCode { get; set; } = string.Empty;

    public DateTime OtpExpiresAt { get; set; }

    public bool OtpVerified { get; set; } = false;

    public int OtpAttempts { get; set; } = 0;

    // Reset Token Phase (หลัง OTP verified)
    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiresAt { get; set; }

    // Common
    public bool IsUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; }

    // Navigation
    public virtual TbUser User { get; set; } = null!;
}
