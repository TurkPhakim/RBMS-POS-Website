using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbMenuConfiguration : IEntityTypeConfiguration<TbMenu>
{
    public void Configure(EntityTypeBuilder<TbMenu> builder)
    {
        builder.ToTable("TbMenus");

        // Primary Key
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

        builder.Property(m => m.Price)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(m => m.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(m => m.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.IsAvailable)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(m => m.NameThai)
            .HasDatabaseName("IX_Menus_NameThai");

        builder.HasIndex(m => m.NameEnglish)
            .HasDatabaseName("IX_Menus_NameEnglish");

        builder.HasIndex(m => m.Category)
            .HasDatabaseName("IX_Menus_Category");

        builder.HasIndex(m => m.IsActive)
            .HasDatabaseName("IX_Menus_IsActive");

        builder.HasIndex(m => m.IsAvailable)
            .HasDatabaseName("IX_Menus_IsAvailable");

        builder.HasIndex(m => m.DeleteFlag)
            .HasDatabaseName("IX_Menus_DeleteFlag");
    }
}
