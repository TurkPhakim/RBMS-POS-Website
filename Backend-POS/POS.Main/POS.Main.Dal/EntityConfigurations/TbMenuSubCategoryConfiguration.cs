using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbMenuSubCategoryConfiguration : IEntityTypeConfiguration<TbMenuSubCategory>
{
    public void Configure(EntityTypeBuilder<TbMenuSubCategory> builder)
    {
        builder.ToTable("TbMenuSubCategories");

        builder.HasKey(sc => sc.SubCategoryId);

        builder.Property(sc => sc.SubCategoryId)
            .ValueGeneratedOnAdd();

        builder.Property(sc => sc.CategoryType)
            .IsRequired();

        builder.Property(sc => sc.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sc => sc.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(sc => sc.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sc => sc.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(sc => sc.CategoryType)
            .HasDatabaseName("IX_MenuSubCategories_CategoryType");

        builder.HasIndex(sc => sc.IsActive)
            .HasDatabaseName("IX_MenuSubCategories_IsActive");

        builder.HasIndex(sc => sc.DeleteFlag)
            .HasDatabaseName("IX_MenuSubCategories_DeleteFlag");
    }
}
