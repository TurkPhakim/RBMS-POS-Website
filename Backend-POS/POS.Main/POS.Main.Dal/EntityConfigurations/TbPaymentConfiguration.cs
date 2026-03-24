using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbPaymentConfiguration : IEntityTypeConfiguration<TbPayment>
{
    public void Configure(EntityTypeBuilder<TbPayment> builder)
    {
        builder.ToTable("TbPayments");

        builder.HasKey(p => p.PaymentId);

        builder.Property(p => p.PaymentId)
            .ValueGeneratedOnAdd();

        builder.Property(p => p.PaymentMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.AmountDue)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(p => p.AmountReceived)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(p => p.ChangeAmount)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(p => p.SlipOcrAmount)
            .HasColumnType("decimal(12,2)");

        builder.Property(p => p.SlipVerificationStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ESlipVerificationStatus.None);

        builder.Property(p => p.PaymentReference)
            .HasMaxLength(200);

        builder.Property(p => p.PaidAt)
            .IsRequired();

        builder.Property(p => p.Note)
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(p => p.OrderBill)
            .WithMany()
            .HasForeignKey(p => p.OrderBillId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(p => p.CashierSession)
            .WithMany(cs => cs.Payments)
            .HasForeignKey(p => p.CashierSessionId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(p => p.SlipImageFile)
            .WithMany()
            .HasForeignKey(p => p.SlipImageFileId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(p => p.OrderBillId)
            .HasDatabaseName("IX_Payments_OrderBillId");

        builder.HasIndex(p => p.CashierSessionId)
            .HasDatabaseName("IX_Payments_CashierSessionId");

        builder.HasIndex(p => p.PaymentMethod)
            .HasDatabaseName("IX_Payments_PaymentMethod");

        builder.HasIndex(p => p.PaidAt)
            .HasDatabaseName("IX_Payments_PaidAt");

        builder.HasIndex(p => p.DeleteFlag)
            .HasDatabaseName("IX_Payments_DeleteFlag");
    }
}
