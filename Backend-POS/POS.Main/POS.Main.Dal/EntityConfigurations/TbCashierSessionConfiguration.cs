using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbCashierSessionConfiguration : IEntityTypeConfiguration<TbCashierSession>
{
    public void Configure(EntityTypeBuilder<TbCashierSession> builder)
    {
        builder.ToTable("TbCashierSessions");

        builder.HasKey(cs => cs.CashierSessionId);

        builder.Property(cs => cs.CashierSessionId)
            .ValueGeneratedOnAdd();

        builder.Property(cs => cs.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ECashierSessionStatus.Open);

        builder.Property(cs => cs.OpenedAt)
            .IsRequired();

        builder.Property(cs => cs.OpeningCash)
            .IsRequired()
            .HasColumnType("decimal(12,2)");

        builder.Property(cs => cs.ExpectedCash)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(cs => cs.ActualCash)
            .HasColumnType("decimal(12,2)");

        builder.Property(cs => cs.Variance)
            .HasColumnType("decimal(12,2)");

        builder.Property(cs => cs.TotalCashSales)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(cs => cs.TotalQrSales)
            .IsRequired()
            .HasColumnType("decimal(12,2)")
            .HasDefaultValue(0m);

        builder.Property(cs => cs.BillCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(cs => cs.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(cs => cs.User)
            .WithMany()
            .HasForeignKey(cs => cs.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(cs => cs.UserId)
            .HasDatabaseName("IX_CashierSessions_UserId");

        builder.HasIndex(cs => cs.Status)
            .HasDatabaseName("IX_CashierSessions_Status");

        builder.HasIndex(cs => cs.OpenedAt)
            .HasDatabaseName("IX_CashierSessions_OpenedAt");

        builder.HasIndex(cs => cs.DeleteFlag)
            .HasDatabaseName("IX_CashierSessions_DeleteFlag");
    }
}
