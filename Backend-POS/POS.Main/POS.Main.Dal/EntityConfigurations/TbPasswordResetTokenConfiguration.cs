using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbPasswordResetTokenConfiguration : IEntityTypeConfiguration<TbPasswordResetToken>
{
    public void Configure(EntityTypeBuilder<TbPasswordResetToken> builder)
    {
        builder.ToTable("TbPasswordResetTokens");

        builder.HasKey(t => t.PasswordResetTokenId);

        builder.Property(t => t.PasswordResetTokenId)
            .HasDefaultValueSql("NEWID()");

        builder.Property(t => t.OtpCode)
            .IsRequired()
            .HasMaxLength(6);

        builder.Property(t => t.OtpExpiresAt)
            .IsRequired();

        builder.Property(t => t.OtpVerified)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.OtpAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.ResetToken)
            .HasMaxLength(128);

        builder.Property(t => t.IsUsed)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(t => t.ResetToken)
            .HasDatabaseName("IX_PasswordResetTokens_ResetToken");

        builder.HasIndex(t => new { t.UserId, t.IsUsed })
            .HasDatabaseName("IX_PasswordResetTokens_UserUsed");

        // Relationship
        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
