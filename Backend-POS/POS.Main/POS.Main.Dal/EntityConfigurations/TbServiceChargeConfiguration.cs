using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbServiceChargeConfiguration : IEntityTypeConfiguration<TbServiceCharge>
{
    public void Configure(EntityTypeBuilder<TbServiceCharge> builder)
    {
        builder.ToTable("TbServiceCharges");

        // Primary Key
        builder.HasKey(sc => sc.ServiceChargeId);

        builder.Property(sc => sc.ServiceChargeId)
            .ValueGeneratedOnAdd();

        builder.Property(sc => sc.PercentageRate)
            .IsRequired()
            .HasColumnType("decimal(5,2)");

        builder.Property(sc => sc.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sc => sc.Description)
            .HasMaxLength(500);

        builder.Property(sc => sc.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sc => sc.StartDate)
            .HasColumnType("datetime2");

        builder.Property(sc => sc.EndDate)
            .HasColumnType("datetime2");

        builder.Property(sc => sc.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(sc => sc.IsActive)
            .HasDatabaseName("IX_ServiceCharges_IsActive");

        builder.HasIndex(sc => sc.DeleteFlag)
            .HasDatabaseName("IX_ServiceCharges_DeleteFlag");

        builder.HasIndex(sc => sc.Name)
            .HasDatabaseName("IX_ServiceCharges_Name");

        builder.HasIndex(sc => sc.StartDate)
            .HasDatabaseName("IX_ServiceCharges_StartDate");

        builder.HasIndex(sc => sc.EndDate)
            .HasDatabaseName("IX_ServiceCharges_EndDate");
    }
}
