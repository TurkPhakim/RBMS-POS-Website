using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbTableConfiguration : IEntityTypeConfiguration<TbTable>
{
    public void Configure(EntityTypeBuilder<TbTable> builder)
    {
        builder.ToTable("TbTables");

        builder.HasKey(t => t.TableId);

        builder.Property(t => t.TableId)
            .ValueGeneratedOnAdd();

        builder.Property(t => t.TableName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Capacity)
            .IsRequired();

        builder.Property(t => t.PositionX)
            .IsRequired()
            .HasDefaultValue(0.0);

        builder.Property(t => t.PositionY)
            .IsRequired()
            .HasDefaultValue(0.0);

        builder.Property(t => t.Size)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ETableSize.Medium);

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ETableStatus.Available);

        builder.Property(t => t.GuestType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.Note)
            .HasMaxLength(500);

        builder.Property(t => t.QrToken)
            .HasMaxLength(2000);

        builder.Property(t => t.QrTokenNonce)
            .HasMaxLength(50);

        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(t => t.Zone)
            .WithMany(z => z.Tables)
            .HasForeignKey(t => t.ZoneId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // ActiveOrder (nullable — only set when table has an open order)
        builder.HasOne(t => t.ActiveOrder)
            .WithOne()
            .HasForeignKey<TbTable>(t => t.ActiveOrderId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(t => t.TableName)
            .IsUnique()
            .HasDatabaseName("IX_Tables_TableName");

        builder.HasIndex(t => t.ZoneId)
            .HasDatabaseName("IX_Tables_ZoneId");

        builder.HasIndex(t => t.Status)
            .HasDatabaseName("IX_Tables_Status");

        builder.HasIndex(t => t.DeleteFlag)
            .HasDatabaseName("IX_Tables_DeleteFlag");
    }
}
