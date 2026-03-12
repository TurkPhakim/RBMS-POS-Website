using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbFileConfiguration : IEntityTypeConfiguration<TbFile>
{
    public void Configure(EntityTypeBuilder<TbFile> builder)
    {
        builder.ToTable("TbFiles");
        builder.HasKey(x => x.FileId);

        builder.Property(x => x.FileId)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.FileExtension)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.FileSize)
            .IsRequired();

        builder.Property(x => x.S3Key)
            .IsRequired()
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(x => x.S3Key).IsUnique();
        builder.HasIndex(x => x.DeleteFlag);
    }
}
