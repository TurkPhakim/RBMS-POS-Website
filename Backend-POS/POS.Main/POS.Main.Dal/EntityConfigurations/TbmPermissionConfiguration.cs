using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbmPermissionConfiguration : IEntityTypeConfiguration<TbmPermission>
{
    public void Configure(EntityTypeBuilder<TbmPermission> builder)
    {
        builder.ToTable("TbmPermissions");

        builder.HasKey(p => p.PermissionId);

        builder.Property(p => p.PermissionId)
            .ValueGeneratedOnAdd();

        builder.Property(p => p.PermissionName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.PermissionCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.SortOrder)
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(p => p.PermissionCode)
            .IsUnique()
            .HasDatabaseName("IX_TbmPermissions_PermissionCode");

        builder.HasIndex(p => p.DeleteFlag)
            .HasDatabaseName("IX_TbmPermissions_DeleteFlag");

        // Seed Data
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new TbmPermission { PermissionId = 1, PermissionName = "แสดง", PermissionCode = "read", SortOrder = 1, CreatedAt = seedDate },
            new TbmPermission { PermissionId = 2, PermissionName = "เพิ่ม", PermissionCode = "create", SortOrder = 2, CreatedAt = seedDate },
            new TbmPermission { PermissionId = 3, PermissionName = "แก้ไข", PermissionCode = "update", SortOrder = 3, CreatedAt = seedDate },
            new TbmPermission { PermissionId = 4, PermissionName = "ลบ", PermissionCode = "delete", SortOrder = 4, CreatedAt = seedDate }
        );
    }
}
