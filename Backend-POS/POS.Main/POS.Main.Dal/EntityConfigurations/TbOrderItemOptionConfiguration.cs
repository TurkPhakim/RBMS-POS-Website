using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOrderItemOptionConfiguration : IEntityTypeConfiguration<TbOrderItemOption>
{
    public void Configure(EntityTypeBuilder<TbOrderItemOption> builder)
    {
        builder.ToTable("TbOrderItemOptions");

        builder.HasKey(oio => oio.OrderItemOptionId);

        builder.Property(oio => oio.OrderItemOptionId)
            .ValueGeneratedOnAdd();

        builder.Property(oio => oio.OptionGroupName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(oio => oio.OptionItemName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(oio => oio.AdditionalPrice)
            .IsRequired()
            .HasColumnType("decimal(10,2)")
            .HasDefaultValue(0m);

        // Relationships
        builder.HasOne(oio => oio.OrderItem)
            .WithMany(oi => oi.OrderItemOptions)
            .HasForeignKey(oio => oio.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(oio => oio.OptionGroup)
            .WithMany()
            .HasForeignKey(oio => oio.OptionGroupId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(oio => oio.OptionItem)
            .WithMany()
            .HasForeignKey(oio => oio.OptionItemId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(oio => oio.OrderItemId)
            .HasDatabaseName("IX_OrderItemOptions_OrderItemId");
    }
}
