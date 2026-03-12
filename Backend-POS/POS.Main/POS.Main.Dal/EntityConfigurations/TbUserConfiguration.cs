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

        builder.HasMany(u => u.LoginHistory)
            .WithOne(lh => lh.User)
            .HasForeignKey(lh => lh.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed Data - Default Users
        builder.HasData(
            new TbUser
            {
                UserId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Username = "admin",
                Email = "admin@rbms-pos.com",
                PasswordHash = "$2a$12$jFxdbEzkVa0AKgGMgTUuzOHAjkCd2rB46tqHVxdZ1DIhjFV4hyGqy",
                IsActive = true,
                FailedLoginAttempts = 0,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new TbUser
            {
                UserId = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Username = "manager",
                Email = "manager@rbms-pos.com",
                PasswordHash = "$2a$12$fpUs6ZgTJQx.zxmSaYjji.rCPW/Mj/cj9j6zYeTOrqZWqIs7sQ4zO",
                IsActive = true,
                FailedLoginAttempts = 0,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            },
            new TbUser
            {
                UserId = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Username = "cashier",
                Email = "cashier@rbms-pos.com",
                PasswordHash = "$2a$12$Oj0MxHU71XQrOq04Q3voJOFC42JliARijrR0wKLNHL1Xa1.CmePuG",
                IsActive = true,
                FailedLoginAttempts = 0,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            }
        );
    }
}
