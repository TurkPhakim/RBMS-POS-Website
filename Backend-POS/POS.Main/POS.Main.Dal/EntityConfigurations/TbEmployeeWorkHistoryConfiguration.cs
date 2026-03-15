using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbEmployeeWorkHistoryConfiguration : IEntityTypeConfiguration<TbEmployeeWorkHistory>
{
    public void Configure(EntityTypeBuilder<TbEmployeeWorkHistory> builder)
    {
        builder.ToTable("TbEmployeeWorkHistories");

        builder.HasKey(w => w.WorkHistoryId);

        builder.Property(w => w.WorkHistoryId)
            .ValueGeneratedOnAdd();

        builder.Property(w => w.Workplace)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.WorkPhone)
            .HasMaxLength(20);

        builder.Property(w => w.Position)
            .HasMaxLength(200);

        builder.Property(w => w.StartDate)
            .IsRequired();

        builder.HasOne(w => w.Employee)
            .WithMany(e => e.WorkHistories)
            .HasForeignKey(w => w.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => w.EmployeeId)
            .HasDatabaseName("IX_EmployeeWorkHistories_EmployeeId");
    }
}
