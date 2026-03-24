using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbZoneConfiguration : IEntityTypeConfiguration<TbZone>
{
    public void Configure(EntityTypeBuilder<TbZone> builder)
    {
        builder.ToTable("TbZones");

        builder.HasKey(z => z.ZoneId);

        builder.Property(z => z.ZoneId)
            .ValueGeneratedOnAdd();

        builder.Property(z => z.ZoneName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(z => z.Color)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(z => z.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(z => z.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(z => z.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(z => z.ZoneName)
            .IsUnique()
            .HasDatabaseName("IX_Zones_ZoneName");

        builder.HasIndex(z => z.IsActive)
            .HasDatabaseName("IX_Zones_IsActive");

        builder.HasIndex(z => z.SortOrder)
            .HasDatabaseName("IX_Zones_SortOrder");

        builder.HasIndex(z => z.DeleteFlag)
            .HasDatabaseName("IX_Zones_DeleteFlag");
    }
}
