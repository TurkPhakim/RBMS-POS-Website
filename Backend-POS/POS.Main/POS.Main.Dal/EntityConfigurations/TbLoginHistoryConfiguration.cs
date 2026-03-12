using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbLoginHistoryConfiguration : IEntityTypeConfiguration<TbLoginHistory>
{
    public void Configure(EntityTypeBuilder<TbLoginHistory> builder)
    {
        builder.ToTable("TbLoginHistory");

        // Primary Key
        builder.HasKey(lh => lh.LoginHistoryId);

        builder.Property(lh => lh.LoginHistoryId)
            .HasDefaultValueSql("NEWID()");

        builder.Property(lh => lh.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(lh => lh.Success)
            .IsRequired();

        builder.Property(lh => lh.FailureReason)
            .HasMaxLength(255);

        builder.Property(lh => lh.IpAddress)
            .HasMaxLength(50);

        builder.Property(lh => lh.UserAgent)
            .HasMaxLength(500);

        builder.Property(lh => lh.LoginDate)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(lh => lh.UserId)
            .HasDatabaseName("IX_LoginHistory_UserId");

        builder.HasIndex(lh => lh.Username)
            .HasDatabaseName("IX_LoginHistory_Username");

        builder.HasIndex(lh => lh.LoginDate)
            .HasDatabaseName("IX_LoginHistory_LoginDate");

        builder.HasIndex(lh => lh.IpAddress)
            .HasDatabaseName("IX_LoginHistory_IpAddress");
    }
}
