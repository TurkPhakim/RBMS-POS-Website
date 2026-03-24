using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbNotificationConfiguration : IEntityTypeConfiguration<TbNotification>
{
    public void Configure(EntityTypeBuilder<TbNotification> builder)
    {
        builder.ToTable("TbNotifications");

        builder.HasKey(n => n.NotificationId);

        builder.Property(n => n.NotificationId)
            .ValueGeneratedOnAdd();

        builder.Property(n => n.EventType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(n => n.TargetGroup)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(n => n.Payload)
            .HasColumnType("nvarchar(max)");

        builder.Property(n => n.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(n => n.Table)
            .WithMany()
            .HasForeignKey(n => n.TableId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(n => n.Order)
            .WithMany()
            .HasForeignKey(n => n.OrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(n => n.Reservation)
            .WithMany()
            .HasForeignKey(n => n.ReservationId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(n => n.EventType)
            .HasDatabaseName("IX_Notifications_EventType");

        builder.HasIndex(n => n.TargetGroup)
            .HasDatabaseName("IX_Notifications_TargetGroup");

        builder.HasIndex(n => n.CreatedAt)
            .HasDatabaseName("IX_Notifications_CreatedAt");

        builder.HasIndex(n => n.TableId)
            .HasDatabaseName("IX_Notifications_TableId");

        builder.HasIndex(n => n.OrderId)
            .HasDatabaseName("IX_Notifications_OrderId");
    }
}
