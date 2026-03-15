using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbEmployeeAddressConfiguration : IEntityTypeConfiguration<TbEmployeeAddress>
{
    public void Configure(EntityTypeBuilder<TbEmployeeAddress> builder)
    {
        builder.ToTable("TbEmployeeAddresses");

        builder.HasKey(a => a.AddressId);

        builder.Property(a => a.AddressId)
            .ValueGeneratedOnAdd();

        builder.Property(a => a.AddressType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.HouseNumber)
            .HasMaxLength(50);

        builder.Property(a => a.Building)
            .HasMaxLength(200);

        builder.Property(a => a.Moo)
            .HasMaxLength(50);

        builder.Property(a => a.Soi)
            .HasMaxLength(100);

        builder.Property(a => a.Yaek)
            .HasMaxLength(100);

        builder.Property(a => a.Road)
            .HasMaxLength(200);

        builder.Property(a => a.SubDistrict)
            .HasMaxLength(100);

        builder.Property(a => a.District)
            .HasMaxLength(100);

        builder.Property(a => a.Province)
            .HasMaxLength(100);

        builder.Property(a => a.PostalCode)
            .HasMaxLength(10);

        builder.HasOne(a => a.Employee)
            .WithMany(e => e.Addresses)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.EmployeeId)
            .HasDatabaseName("IX_EmployeeAddresses_EmployeeId");
    }
}
