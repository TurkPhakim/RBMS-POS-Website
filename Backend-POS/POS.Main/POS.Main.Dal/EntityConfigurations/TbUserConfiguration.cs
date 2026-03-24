using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbUserConfiguration : IEntityTypeConfiguration<TbUser>
{
    public void Configure(EntityTypeBuilder<TbUser> builder)
    {
        builder.ToTable("TbUsers");

        // Primary Key
        builder.HasKey(u => u.UserId);

        builder.Property(u => u.UserId)
            .HasDefaultValueSql("NEWID()");

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.FailedLoginAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.LockoutCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.IsLockedByAdmin)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(u => u.PinCodeHash)
            .HasMaxLength(256);

        builder.Property(u => u.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(u => u.UpdatedAt);

        // Indexes
        builder.HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username");

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(u => u.IsActive)
            .HasDatabaseName("IX_Users_IsActive");

        builder.HasIndex(u => u.DeleteFlag)
            .HasDatabaseName("IX_Users_DeleteFlag");

        // Relationships
        builder.HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.User)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Restrict);


    }
}
