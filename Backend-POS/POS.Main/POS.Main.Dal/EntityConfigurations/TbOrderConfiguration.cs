using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOrderConfiguration : IEntityTypeConfiguration<TbOrder>
{
    public void Configure(EntityTypeBuilder<TbOrder> builder)
    {
        builder.ToTable("TbOrders");

        builder.HasKey(o => o.OrderId);

        builder.Property(o => o.OrderId)
            .ValueGeneratedOnAdd();

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(EOrderStatus.Open);

        builder.Property(o => o.GuestCount)
            .IsRequired();

        builder.Property(o => o.SubTotal)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(o => o.Note)
            .HasMaxLength(500);

        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(o => o.Table)
            .WithMany(t => t.Orders)
            .HasForeignKey(o => o.TableId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique()
            .HasDatabaseName("IX_Orders_OrderNumber");

        builder.HasIndex(o => o.TableId)
            .HasDatabaseName("IX_Orders_TableId");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_Orders_Status");

        builder.HasIndex(o => o.CreatedAt)
            .HasDatabaseName("IX_Orders_CreatedAt");

        builder.HasIndex(o => o.DeleteFlag)
            .HasDatabaseName("IX_Orders_DeleteFlag");
    }
}
