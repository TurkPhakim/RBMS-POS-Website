using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POS.Main.Dal.Entities;

namespace POS.Main.Dal.EntityConfigurations;

public class TbmAuthorizeMatrixConfiguration : IEntityTypeConfiguration<TbmAuthorizeMatrix>
{
    public void Configure(EntityTypeBuilder<TbmAuthorizeMatrix> builder)
    {
        builder.ToTable("TbmAuthorizeMatrices");

        builder.HasKey(am => am.AuthorizeMatrixId);

        builder.Property(am => am.AuthorizeMatrixId)
            .ValueGeneratedOnAdd();

        builder.Property(am => am.PermissionPath)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(am => am.CreatedAt)
            .IsRequired();

        // Relationships
        builder.HasOne(am => am.Module)
            .WithMany(m => m.AuthorizeMatrices)
            .HasForeignKey(am => am.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(am => am.Permission)
            .WithMany(p => p.AuthorizeMatrices)
            .HasForeignKey(am => am.PermissionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(am => am.PermissionPath)
            .IsUnique()
            .HasDatabaseName("IX_TbmAuthorizeMatrices_PermissionPath");

        builder.HasIndex(am => new { am.ModuleId, am.PermissionId })
            .IsUnique()
            .HasDatabaseName("IX_TbmAuthorizeMatrices_Module_Permission");

        builder.HasIndex(am => am.DeleteFlag)
            .HasDatabaseName("IX_TbmAuthorizeMatrices_DeleteFlag");

        // Seed Data — Module + Permission combinations
        // Module IDs: 9=dashboard.view, 10=service-charge, 11=position, 12=employee,
        //             13=menu-item, 14=order-manage, 15=table-manage, 16=payment-manage, 17=kitchen-order
        // Permission IDs: 1=read, 2=create, 3=update, 4=delete
        var seedDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var id = 1;
        builder.HasData(
            // Dashboard — read only
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 9, PermissionId = 1, PermissionPath = "dashboard.view.read", CreatedAt = seedDate },

            // Service Charge — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 10, PermissionId = 1, PermissionPath = "service-charge.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 10, PermissionId = 2, PermissionPath = "service-charge.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 10, PermissionId = 3, PermissionPath = "service-charge.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 10, PermissionId = 4, PermissionPath = "service-charge.delete", CreatedAt = seedDate },

            // Position — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 11, PermissionId = 1, PermissionPath = "position.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 11, PermissionId = 2, PermissionPath = "position.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 11, PermissionId = 3, PermissionPath = "position.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 11, PermissionId = 4, PermissionPath = "position.delete", CreatedAt = seedDate },

            // Employee — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 12, PermissionId = 1, PermissionPath = "employee.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 12, PermissionId = 2, PermissionPath = "employee.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 12, PermissionId = 3, PermissionPath = "employee.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 12, PermissionId = 4, PermissionPath = "employee.delete", CreatedAt = seedDate },

            // Menu — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 13, PermissionId = 1, PermissionPath = "menu-item.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 13, PermissionId = 2, PermissionPath = "menu-item.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 13, PermissionId = 3, PermissionPath = "menu-item.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 13, PermissionId = 4, PermissionPath = "menu-item.delete", CreatedAt = seedDate },

            // Order — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 14, PermissionId = 1, PermissionPath = "order-manage.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 14, PermissionId = 2, PermissionPath = "order-manage.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 14, PermissionId = 3, PermissionPath = "order-manage.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 14, PermissionId = 4, PermissionPath = "order-manage.delete", CreatedAt = seedDate },

            // Table — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 15, PermissionId = 1, PermissionPath = "table-manage.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 15, PermissionId = 2, PermissionPath = "table-manage.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 15, PermissionId = 3, PermissionPath = "table-manage.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 15, PermissionId = 4, PermissionPath = "table-manage.delete", CreatedAt = seedDate },

            // Payment — CRUD
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 16, PermissionId = 1, PermissionPath = "payment-manage.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 16, PermissionId = 2, PermissionPath = "payment-manage.create", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 16, PermissionId = 3, PermissionPath = "payment-manage.update", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 16, PermissionId = 4, PermissionPath = "payment-manage.delete", CreatedAt = seedDate },

            // Kitchen Display — read + update only
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 17, PermissionId = 1, PermissionPath = "kitchen-order.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 17, PermissionId = 3, PermissionPath = "kitchen-order.update", CreatedAt = seedDate },

            // Shop Settings — read + update only
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id++, ModuleId = 18, PermissionId = 1, PermissionPath = "shop-settings.read", CreatedAt = seedDate },
            new TbmAuthorizeMatrix { AuthorizeMatrixId = id, ModuleId = 18, PermissionId = 3, PermissionPath = "shop-settings.update", CreatedAt = seedDate }
        );
    }
}
