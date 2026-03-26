using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbmPositionConfiguration : IEntityTypeConfiguration<TbmPosition>
{
    public void Configure(EntityTypeBuilder<TbmPosition> builder)
    {
        builder.ToTable("TbmPositions");

        builder.HasKey(p => p.PositionId);

        builder.Property(p => p.PositionId)
            .ValueGeneratedOnAdd();

        builder.Property(p => p.PositionName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(p => p.PositionName)
            .IsUnique()
            .HasDatabaseName("IX_TbmPositions_PositionName");

        builder.HasIndex(p => p.IsActive)
            .HasDatabaseName("IX_TbmPositions_IsActive");

        builder.HasIndex(p => p.DeleteFlag)
            .HasDatabaseName("IX_TbmPositions_DeleteFlag");

        // Seed Data
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new TbmPosition { PositionId = 1, PositionName = "ผู้ดูแลระบบ", Description = "ดูแลระบบทั้งหมด สิทธิ์เข้าถึงทุกฟังก์ชัน", IsActive = true, CreatedAt = seedDate }
        );
    }
}
