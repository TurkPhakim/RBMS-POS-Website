using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbmModuleConfiguration : IEntityTypeConfiguration<TbmModule>
{
    public void Configure(EntityTypeBuilder<TbmModule> builder)
    {
        builder.ToTable("TbmModules");

        builder.HasKey(m => m.ModuleId);

        builder.Property(m => m.ModuleId)
            .ValueGeneratedOnAdd();

        builder.Property(m => m.ModuleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.ModuleCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(m => m.SortOrder)
            .IsRequired();

        builder.Property(m => m.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        // Self-referencing relationship (parent-child hierarchy)
        builder.HasOne(m => m.ParentModule)
            .WithMany(m => m.ChildModules)
            .HasForeignKey(m => m.ParentModuleId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(m => m.ModuleCode)
            .IsUnique()
            .HasDatabaseName("IX_TbmModules_ModuleCode");

        builder.HasIndex(m => m.ParentModuleId)
            .HasDatabaseName("IX_TbmModules_ParentModuleId");

        builder.HasIndex(m => m.DeleteFlag)
            .HasDatabaseName("IX_TbmModules_DeleteFlag");

        // Seed Data — Parent Modules (Level 0)
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            // Parent Modules
            new TbmModule { ModuleId = 1, ModuleName = "แดชบอร์ด", ModuleCode = "dashboard", ParentModuleId = null, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 2, ModuleName = "ตั้งค่าระบบ", ModuleCode = "admin-settings", ParentModuleId = null, SortOrder = 2, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 3, ModuleName = "ทรัพยากรบุคคล", ModuleCode = "human-resource", ParentModuleId = null, SortOrder = 3, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 4, ModuleName = "เมนู", ModuleCode = "menu", ParentModuleId = null, SortOrder = 4, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 5, ModuleName = "ออเดอร์", ModuleCode = "order", ParentModuleId = null, SortOrder = 5, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 6, ModuleName = "โต๊ะ", ModuleCode = "table", ParentModuleId = null, SortOrder = 6, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 7, ModuleName = "ชำระเงิน", ModuleCode = "payment", ParentModuleId = null, SortOrder = 7, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 8, ModuleName = "ครัว", ModuleCode = "kitchen-display", ParentModuleId = null, SortOrder = 8, IsActive = true, CreatedAt = seedDate },

            // Child Modules (Level 1)
            new TbmModule { ModuleId = 9, ModuleName = "Dashboard", ModuleCode = "dashboard.view", ParentModuleId = 1, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 10, ModuleName = "Service Charge", ModuleCode = "service-charge", ParentModuleId = 2, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 11, ModuleName = "จัดการตำแหน่ง", ModuleCode = "position", ParentModuleId = 2, SortOrder = 2, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 12, ModuleName = "จัดการพนักงาน", ModuleCode = "employee", ParentModuleId = 3, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 13, ModuleName = "จัดการเมนู", ModuleCode = "menu-item", ParentModuleId = 4, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 14, ModuleName = "จัดการออเดอร์", ModuleCode = "order-manage", ParentModuleId = 5, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 15, ModuleName = "จัดการโต๊ะ", ModuleCode = "table-manage", ParentModuleId = 6, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 16, ModuleName = "ชำระเงิน", ModuleCode = "payment-manage", ParentModuleId = 7, SortOrder = 1, IsActive = true, CreatedAt = seedDate },
            new TbmModule { ModuleId = 17, ModuleName = "แสดงออเดอร์ครัว", ModuleCode = "kitchen-order", ParentModuleId = 8, SortOrder = 1, IsActive = true, CreatedAt = seedDate }
        );
    }
}
