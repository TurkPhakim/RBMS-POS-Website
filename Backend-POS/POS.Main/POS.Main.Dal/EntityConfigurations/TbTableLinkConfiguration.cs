using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbTableLinkConfiguration : IEntityTypeConfiguration<TbTableLink>
{
    public void Configure(EntityTypeBuilder<TbTableLink> builder)
    {
        builder.ToTable("TbTableLinks");

        builder.HasKey(tl => tl.TableLinkId);

        builder.Property(tl => tl.TableLinkId)
            .ValueGeneratedOnAdd();

        builder.Property(tl => tl.GroupCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(tl => tl.IsPrimary)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(tl => tl.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(tl => tl.Table)
            .WithMany(t => t.TableLinks)
            .HasForeignKey(tl => tl.TableId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        // Indexes
        builder.HasIndex(tl => tl.TableId)
            .IsUnique()
            .HasDatabaseName("IX_TableLinks_TableId");

        builder.HasIndex(tl => tl.GroupCode)
            .HasDatabaseName("IX_TableLinks_GroupCode");
    }
}
