using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbCashDrawerTransactionConfiguration : IEntityTypeConfiguration<TbCashDrawerTransaction>
{
    public void Configure(EntityTypeBuilder<TbCashDrawerTransaction> builder)
    {
        builder.ToTable("TbCashDrawerTransactions");

        builder.HasKey(t => t.CashDrawerTransactionId);

        builder.Property(t => t.CashDrawerTransactionId)
            .ValueGeneratedOnAdd();

        builder.Property(t => t.TransactionType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.Amount)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(t => t.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(t => t.CashierSession)
            .WithMany(cs => cs.CashDrawerTransactions)
            .HasForeignKey(t => t.CashierSessionId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(t => t.CashierSessionId)
            .HasDatabaseName("IX_CashDrawerTransactions_CashierSessionId");

        builder.HasIndex(t => t.DeleteFlag)
            .HasDatabaseName("IX_CashDrawerTransactions_DeleteFlag");
    }
}
