using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbEmployeeEducationConfiguration : IEntityTypeConfiguration<TbEmployeeEducation>
{
    public void Configure(EntityTypeBuilder<TbEmployeeEducation> builder)
    {
        builder.ToTable("TbEmployeeEducations");

        builder.HasKey(e => e.EducationId);

        builder.Property(e => e.EducationId)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.EducationLevel)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Major)
            .HasMaxLength(200);

        builder.Property(e => e.Institution)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Gpa)
            .HasColumnType("decimal(3,2)");

        builder.HasOne(e => e.Employee)
            .WithMany(emp => emp.Educations)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.EmployeeId)
            .HasDatabaseName("IX_EmployeeEducations_EmployeeId");
    }
}
