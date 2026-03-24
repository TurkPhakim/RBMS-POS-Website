using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbReservationConfiguration : IEntityTypeConfiguration<TbReservation>
{
    public void Configure(EntityTypeBuilder<TbReservation> builder)
    {
        builder.ToTable("TbReservations");

        builder.HasKey(r => r.ReservationId);

        builder.Property(r => r.ReservationId)
            .ValueGeneratedOnAdd();

        builder.Property(r => r.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.CustomerPhone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(r => r.ReservationDate)
            .IsRequired();

        builder.Property(r => r.ReservationTime)
            .IsRequired();

        builder.Property(r => r.GuestCount)
            .IsRequired();

        builder.Property(r => r.Note)
            .HasMaxLength(500);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(EReservationStatus.Pending);

        builder.Property(r => r.ReminderSent)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(r => r.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TableId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(r => new { r.ReservationDate, r.Status })
            .HasDatabaseName("IX_Reservations_Date_Status");

        builder.HasIndex(r => r.TableId)
            .HasDatabaseName("IX_Reservations_TableId");

        builder.HasIndex(r => r.DeleteFlag)
            .HasDatabaseName("IX_Reservations_DeleteFlag");
    }
}
