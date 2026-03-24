using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbMenuConfiguration : IEntityTypeConfiguration<TbMenu>
{
    public void Configure(EntityTypeBuilder<TbMenu> builder)
    {
        builder.ToTable("TbMenus");

        builder.HasKey(m => m.MenuId);

        builder.Property(m => m.MenuId)
            .ValueGeneratedOnAdd();

        builder.Property(m => m.NameThai)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.NameEnglish)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(1000);

        builder.HasOne(m => m.ImageFile)
            .WithMany()
            .HasForeignKey(m => m.ImageFileId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(m => m.ImageFileId);

        builder.HasOne(m => m.SubCategory)
            .WithMany(sc => sc.Menus)
            .HasForeignKey(m => m.SubCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.Property(m => m.Price)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(m => m.CostPrice)
            .HasColumnType("decimal(10,2)");

        builder.Property(m => m.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.IsAvailablePeriod1)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.IsAvailablePeriod2)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.Tags)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(m => m.Allergens)
            .HasMaxLength(500);

        builder.Property(m => m.CaloriesPerServing)
            .HasColumnType("decimal(8,2)");

        builder.Property(m => m.IsPinned)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(m => m.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(m => m.NameThai)
            .HasDatabaseName("IX_Menus_NameThai");

        builder.HasIndex(m => m.NameEnglish)
            .HasDatabaseName("IX_Menus_NameEnglish");

        builder.HasIndex(m => m.SubCategoryId)
            .HasDatabaseName("IX_Menus_SubCategoryId");

        builder.HasIndex(m => m.IsAvailable)
            .HasDatabaseName("IX_Menus_IsAvailable");

        builder.HasIndex(m => m.IsPinned)
            .HasDatabaseName("IX_Menus_IsPinned");

        builder.HasIndex(m => m.DeleteFlag)
            .HasDatabaseName("IX_Menus_DeleteFlag");
    }
}
