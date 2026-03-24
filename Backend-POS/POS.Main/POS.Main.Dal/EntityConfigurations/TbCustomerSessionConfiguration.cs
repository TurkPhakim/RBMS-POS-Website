using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbCustomerSessionConfiguration : IEntityTypeConfiguration<TbCustomerSession>
{
    public void Configure(EntityTypeBuilder<TbCustomerSession> builder)
    {
        builder.ToTable("TbCustomerSessions");

        builder.HasKey(cs => cs.CustomerSessionId);

        builder.Property(cs => cs.CustomerSessionId)
            .ValueGeneratedOnAdd();

        builder.Property(cs => cs.SessionToken)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(cs => cs.Nickname)
            .HasMaxLength(20);

        builder.Property(cs => cs.DeviceFingerprint)
            .HasMaxLength(200);

        builder.Property(cs => cs.QrTokenNonce)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(cs => cs.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(cs => cs.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(cs => cs.ExpiresAt)
            .IsRequired();

        // Relationships
        builder.HasOne(cs => cs.Table)
            .WithMany()
            .HasForeignKey(cs => cs.TableId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(cs => cs.SessionToken)
            .HasDatabaseName("IX_CustomerSessions_SessionToken");

        builder.HasIndex(cs => cs.TableId)
            .HasDatabaseName("IX_CustomerSessions_TableId");

        builder.HasIndex(cs => cs.IsActive)
            .HasDatabaseName("IX_CustomerSessions_IsActive");
    }
}
