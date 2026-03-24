using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbOrderBillConfiguration : IEntityTypeConfiguration<TbOrderBill>
{
    public void Configure(EntityTypeBuilder<TbOrderBill> builder)
    {
        builder.ToTable("TbOrderBills");

        builder.HasKey(ob => ob.OrderBillId);

        builder.Property(ob => ob.OrderBillId)
            .ValueGeneratedOnAdd();

        builder.Property(ob => ob.BillNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(ob => ob.BillType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(EBillType.Full);

        builder.Property(ob => ob.SubTotal)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(ob => ob.TotalDiscountAmount)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(ob => ob.NetAmount)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(ob => ob.ServiceChargeRate)
            .IsRequired()
            .HasColumnType("decimal(5,2)");

        builder.Property(ob => ob.ServiceChargeAmount)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(ob => ob.VatRate)
            .IsRequired()
            .HasColumnType("decimal(5,2)");

        builder.Property(ob => ob.VatAmount)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(ob => ob.GrandTotal)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(ob => ob.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(EBillStatus.Pending);

        builder.Property(ob => ob.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(ob => ob.Order)
            .WithMany(o => o.OrderBills)
            .HasForeignKey(ob => ob.OrderId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(ob => ob.BillNumber)
            .IsUnique()
            .HasDatabaseName("IX_OrderBills_BillNumber");

        builder.HasIndex(ob => ob.OrderId)
            .HasDatabaseName("IX_OrderBills_OrderId");

        builder.HasIndex(ob => ob.Status)
            .HasDatabaseName("IX_OrderBills_Status");

        builder.HasIndex(ob => ob.DeleteFlag)
            .HasDatabaseName("IX_OrderBills_DeleteFlag");
    }
}
