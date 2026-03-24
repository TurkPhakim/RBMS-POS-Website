using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbNotificationReadConfiguration : IEntityTypeConfiguration<TbNotificationRead>
{
    public void Configure(EntityTypeBuilder<TbNotificationRead> builder)
    {
        builder.ToTable("TbNotificationReads");

        builder.HasKey(nr => nr.NotificationReadId);

        builder.Property(nr => nr.NotificationReadId)
            .ValueGeneratedOnAdd();

        builder.Property(nr => nr.ReadAt);

        builder.Property(nr => nr.ClearedAt);

        // Relationships
        builder.HasOne(nr => nr.Notification)
            .WithMany(n => n.NotificationReads)
            .HasForeignKey(nr => nr.NotificationId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(nr => nr.User)
            .WithMany()
            .HasForeignKey(nr => nr.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        // Unique constraint: 1 user can only have 1 read record per notification
        builder.HasIndex(nr => new { nr.NotificationId, nr.UserId })
            .IsUnique()
            .HasDatabaseName("IX_NotificationReads_NotificationId_UserId");
    }
}
