using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOptionGroupConfiguration : IEntityTypeConfiguration<TbOptionGroup>
{
    public void Configure(EntityTypeBuilder<TbOptionGroup> builder)
    {
        builder.ToTable("TbOptionGroups");

        builder.HasKey(og => og.OptionGroupId);

        builder.Property(og => og.OptionGroupId)
            .ValueGeneratedOnAdd();

        builder.Property(og => og.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(og => og.CategoryType)
            .IsRequired();

        builder.Property(og => og.IsRequired)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(og => og.MinSelect)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(og => og.MaxSelect)
            .IsRequired(false);

        builder.Property(og => og.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(og => og.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(og => og.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(og => og.CategoryType)
            .HasDatabaseName("IX_OptionGroups_CategoryType");

        builder.HasIndex(og => og.IsActive)
            .HasDatabaseName("IX_OptionGroups_IsActive");
    }
}
