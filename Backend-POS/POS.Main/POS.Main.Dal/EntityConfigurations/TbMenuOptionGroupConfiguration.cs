using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbMenuOptionGroupConfiguration : IEntityTypeConfiguration<TbMenuOptionGroup>
{
    public void Configure(EntityTypeBuilder<TbMenuOptionGroup> builder)
    {
        builder.ToTable("TbMenuOptionGroups");

        builder.HasKey(mog => mog.MenuOptionGroupId);

        builder.Property(mog => mog.MenuOptionGroupId)
            .ValueGeneratedOnAdd();

        builder.Property(mog => mog.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(mog => mog.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // FK → TbMenu
        builder.HasOne(mog => mog.Menu)
            .WithMany(m => m.MenuOptionGroups)
            .HasForeignKey(mog => mog.MenuId)
            .OnDelete(DeleteBehavior.Cascade);

        // FK → TbOptionGroup
        builder.HasOne(mog => mog.OptionGroup)
            .WithMany(og => og.MenuOptionGroups)
            .HasForeignKey(mog => mog.OptionGroupId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique constraint: MenuId + OptionGroupId
        builder.HasIndex(mog => new { mog.MenuId, mog.OptionGroupId })
            .IsUnique()
            .HasDatabaseName("IX_MenuOptionGroups_MenuId_OptionGroupId");
    }
}
