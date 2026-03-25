using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOrderItemConfiguration : IEntityTypeConfiguration<TbOrderItem>
{
    public void Configure(EntityTypeBuilder<TbOrderItem> builder)
    {
        builder.ToTable("TbOrderItems");

        builder.HasKey(oi => oi.OrderItemId);

        builder.Property(oi => oi.OrderItemId)
            .ValueGeneratedOnAdd();

        builder.Property(oi => oi.MenuNameThai)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(oi => oi.MenuNameEnglish)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(oi => oi.CategoryType)
            .IsRequired();

        builder.Property(oi => oi.Quantity)
            .IsRequired();

        builder.Property(oi => oi.UnitPrice)
            .IsRequired()
            .HasColumnType("decimal(10,2)");

        builder.Property(oi => oi.OptionsTotalPrice)
            .IsRequired()
            .HasColumnType("decimal(10,2)")
            .HasDefaultValue(0m);

        builder.Property(oi => oi.TotalPrice)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(oi => oi.CostPrice)
            .HasColumnType("decimal(10,2)");

        builder.Property(oi => oi.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(EOrderItemStatus.Pending);

        builder.Property(oi => oi.Note)
            .HasMaxLength(500);

        builder.Property(oi => oi.OrderedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(oi => oi.CancelReason)
            .HasMaxLength(500);

        builder.Property(oi => oi.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(oi => oi.Menu)
            .WithMany()
            .HasForeignKey(oi => oi.MenuId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(oi => oi.CancelledByEmployee)
            .WithMany()
            .HasForeignKey(oi => oi.CancelledBy)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(oi => oi.OrderBill)
            .WithMany(ob => ob.OrderItems)
            .HasForeignKey(oi => oi.OrderBillId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(oi => oi.SourceTable)
            .WithMany()
            .HasForeignKey(oi => oi.SourceTableId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(oi => oi.OrderId)
            .HasDatabaseName("IX_OrderItems_OrderId");

        builder.HasIndex(oi => oi.MenuId)
            .HasDatabaseName("IX_OrderItems_MenuId");

        builder.HasIndex(oi => oi.Status)
            .HasDatabaseName("IX_OrderItems_Status");

        builder.HasIndex(oi => oi.CategoryType)
            .HasDatabaseName("IX_OrderItems_CategoryType");

        builder.HasIndex(oi => oi.SourceTableId)
            .HasDatabaseName("IX_OrderItems_SourceTableId");

        builder.HasIndex(oi => oi.DeleteFlag)
            .HasDatabaseName("IX_OrderItems_DeleteFlag");
    }
}
