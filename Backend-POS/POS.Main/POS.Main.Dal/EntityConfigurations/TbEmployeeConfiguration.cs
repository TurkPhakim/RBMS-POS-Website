using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbEmployeeConfiguration : IEntityTypeConfiguration<TbEmployee>
{
    public void Configure(EntityTypeBuilder<TbEmployee> builder)
    {
        builder.ToTable("TbEmployees");

        // Primary Key
        builder.HasKey(e => e.EmployeeId);

        builder.Property(e => e.EmployeeId)
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Title)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.FirstNameThai)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastNameThai)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.FirstNameEnglish)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastNameEnglish)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Nickname)
            .HasMaxLength(50);

        builder.Property(e => e.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.StartDate)
            .IsRequired();

        builder.Property(e => e.NationalId)
            .HasMaxLength(13);

        builder.Property(e => e.BankAccountNumber)
            .HasMaxLength(20);

        builder.Property(e => e.BankName)
            .HasMaxLength(100);

        builder.Property(e => e.Nationality)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Religion)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.LineId)
            .HasMaxLength(50);

        // Position FK
        builder.HasOne(e => e.Position)
            .WithMany(p => p.Employees)
            .HasForeignKey(e => e.PositionId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(e => e.PositionId)
            .HasDatabaseName("IX_Employees_PositionId");

        builder.Property(e => e.Phone)
            .HasMaxLength(20);

        builder.Property(e => e.Email)
            .HasMaxLength(100);

        builder.Property(e => e.IsFullTime)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Salary)
            .HasColumnType("decimal(12,2)");

        builder.Property(e => e.HourlyRate)
            .HasColumnType("decimal(12,2)");

        builder.HasOne(e => e.ImageFile)
            .WithMany()
            .HasForeignKey(e => e.ImageFileId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(e => e.ImageFileId);

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        // 1:1 Relationship with User
        builder.HasOne(e => e.User)
            .WithOne(u => u.Employee)
            .HasForeignKey<TbEmployee>(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(e => e.FirstNameThai)
            .HasDatabaseName("IX_Employees_FirstNameThai");

        builder.HasIndex(e => e.LastNameThai)
            .HasDatabaseName("IX_Employees_LastNameThai");

        builder.HasIndex(e => e.NationalId)
            .HasDatabaseName("IX_Employees_NationalId");

        builder.HasIndex(e => e.Phone)
            .HasDatabaseName("IX_Employees_Phone");

        builder.HasIndex(e => e.Email)
            .HasDatabaseName("IX_Employees_Email");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_Employees_IsActive");

        builder.HasIndex(e => e.DeleteFlag)
            .HasDatabaseName("IX_Employees_DeleteFlag");

        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("IX_Employees_UserId");
    }
}
