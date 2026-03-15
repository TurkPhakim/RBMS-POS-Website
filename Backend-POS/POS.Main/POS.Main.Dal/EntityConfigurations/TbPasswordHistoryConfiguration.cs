using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbPasswordHistoryConfiguration : IEntityTypeConfiguration<TbPasswordHistory>
{
    public void Configure(EntityTypeBuilder<TbPasswordHistory> builder)
    {
        builder.ToTable("TbPasswordHistory");

        builder.HasKey(h => h.PasswordHistoryId);

        builder.Property(h => h.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(h => h.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Index
        builder.HasIndex(h => h.UserId)
            .HasDatabaseName("IX_PasswordHistory_UserId");

        // Relationship
        builder.HasOne(h => h.User)
            .WithMany()
            .HasForeignKey(h => h.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
