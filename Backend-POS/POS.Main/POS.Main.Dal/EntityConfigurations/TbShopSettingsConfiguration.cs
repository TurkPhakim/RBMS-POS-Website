using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbShopSettingsConfiguration : IEntityTypeConfiguration<TbShopSettings>
{
    public void Configure(EntityTypeBuilder<TbShopSettings> builder)
    {
        builder.ToTable("TbShopSettings");

        builder.HasKey(x => x.ShopSettingsId);
        builder.Property(x => x.ShopSettingsId).ValueGeneratedOnAdd();

        // ข้อมูลร้านค้า
        builder.Property(x => x.ShopNameThai).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ShopNameEnglish).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CompanyNameThai).HasMaxLength(200);
        builder.Property(x => x.CompanyNameEnglish).HasMaxLength(200);
        builder.Property(x => x.TaxId).IsRequired().HasMaxLength(13);
        builder.Property(x => x.FoodType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);

        // Flags
        builder.Property(x => x.HasTwoPeriods).IsRequired().HasDefaultValue(false);

        // ที่อยู่และช่องทางติดต่อ
        builder.Property(x => x.Address).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.PhoneNumber).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ShopEmail).HasMaxLength(200);
        builder.Property(x => x.Facebook).HasMaxLength(200);
        builder.Property(x => x.Instagram).HasMaxLength(200);
        builder.Property(x => x.Website).HasMaxLength(500);
        builder.Property(x => x.LineId).HasMaxLength(100);

        builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        // Relationships — FK ไป TbFile (Logo + QR Code)
        builder.HasOne(x => x.LogoFile)
            .WithMany()
            .HasForeignKey(x => x.LogoFileId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasOne(x => x.PaymentQrCodeFile)
            .WithMany()
            .HasForeignKey(x => x.PaymentQrCodeFileId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(x => x.LogoFileId).HasDatabaseName("IX_ShopSettings_LogoFileId");
        builder.HasIndex(x => x.PaymentQrCodeFileId).HasDatabaseName("IX_ShopSettings_PaymentQrCodeFileId");
        builder.HasIndex(x => x.DeleteFlag).HasDatabaseName("IX_ShopSettings_DeleteFlag");

        // Seed Data — singleton record
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new TbShopSettings
            {
                ShopSettingsId = 1,
                ShopNameThai = "",
                ShopNameEnglish = "",
                TaxId = "",
                FoodType = "",
                Address = "",
                PhoneNumber = "",
                HasTwoPeriods = false,
                CreatedAt = seedDate
            }
        );
    }
}
