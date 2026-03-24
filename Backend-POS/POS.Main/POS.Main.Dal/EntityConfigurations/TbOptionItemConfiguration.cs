using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOptionItemConfiguration : IEntityTypeConfiguration<TbOptionItem>
{
    public void Configure(EntityTypeBuilder<TbOptionItem> builder)
    {
        builder.ToTable("TbOptionItems");

        builder.HasKey(oi => oi.OptionItemId);

        builder.Property(oi => oi.OptionItemId)
            .ValueGeneratedOnAdd();

        builder.Property(oi => oi.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(oi => oi.AdditionalPrice)
            .IsRequired()
            .HasColumnType("decimal(10,2)")
            .HasDefaultValue(0m);

        builder.Property(oi => oi.CostPrice)
            .HasColumnType("decimal(10,2)");

        builder.Property(oi => oi.SortOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(oi => oi.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(oi => oi.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // FK → TbOptionGroup (cascade delete)
        builder.HasOne(oi => oi.OptionGroup)
            .WithMany(og => og.OptionItems)
            .HasForeignKey(oi => oi.OptionGroupId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(oi => oi.OptionGroupId)
            .HasDatabaseName("IX_OptionItems_OptionGroupId");
    }
}
