using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbFloorObjectConfiguration : IEntityTypeConfiguration<TbFloorObject>
{
    public void Configure(EntityTypeBuilder<TbFloorObject> builder)
    {
        builder.ToTable("TbFloorObjects");
        builder.HasKey(f => f.FloorObjectId);

        builder.Property(f => f.Label)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.ObjectType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        // Relationship
        builder.HasOne(f => f.Zone)
            .WithMany()
            .HasForeignKey(f => f.ZoneId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(f => f.ZoneId)
            .HasDatabaseName("IX_FloorObjects_ZoneId");

        builder.HasIndex(f => f.DeleteFlag)
            .HasDatabaseName("IX_FloorObjects_DeleteFlag");
    }
}
