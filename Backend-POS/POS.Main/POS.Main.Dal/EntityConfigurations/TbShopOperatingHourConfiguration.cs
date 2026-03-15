using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbShopOperatingHourConfiguration : IEntityTypeConfiguration<TbShopOperatingHour>
{
    public void Configure(EntityTypeBuilder<TbShopOperatingHour> builder)
    {
        builder.ToTable("TbShopOperatingHours");

        builder.HasKey(x => x.ShopOperatingHourId);
        builder.Property(x => x.ShopOperatingHourId).ValueGeneratedOnAdd();

        builder.Property(x => x.DayOfWeek).IsRequired();
        builder.Property(x => x.IsOpen).IsRequired().HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        // Relationship
        builder.HasOne(x => x.ShopSettings)
            .WithMany(s => s.OperatingHours)
            .HasForeignKey(x => x.ShopSettingsId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.ShopSettingsId).HasDatabaseName("IX_ShopOperatingHours_ShopSettingsId");
        builder.HasIndex(x => new { x.ShopSettingsId, x.DayOfWeek })
            .IsUnique()
            .HasDatabaseName("IX_ShopOperatingHours_Settings_Day");
        builder.HasIndex(x => x.DeleteFlag).HasDatabaseName("IX_ShopOperatingHours_DeleteFlag");

        // Seed Data — 7 records (Mon-Sun)
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            Enumerable.Range(1, 7).Select(i => new TbShopOperatingHour
            {
                ShopOperatingHourId = i,
                ShopSettingsId = 1,
                DayOfWeek = (EDayOfWeek)i,
                IsOpen = false,
                CreatedAt = seedDate
            }).ToArray()
        );
    }
}
