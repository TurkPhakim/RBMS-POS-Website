using System.Linq.Expressions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using POS.Main.Dal.Entities;
using POS.Main.Dal.EntityConfigurations;

namespace POS.Main.Dal;

public class POSMainContext : DbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public POSMainContext(DbContextOptions<POSMainContext> options, IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // Authentication DbSets
    public DbSet<TbUser> Users => Set<TbUser>();
    public DbSet<TbRefreshToken> RefreshTokens => Set<TbRefreshToken>();
public DbSet<TbPasswordResetToken> PasswordResetTokens => Set<TbPasswordResetToken>();
    public DbSet<TbPasswordHistory> PasswordHistory => Set<TbPasswordHistory>();

    // Admin Settings DbSets
    public DbSet<TbServiceCharge> ServiceCharges => Set<TbServiceCharge>();
    public DbSet<TbShopSettings> ShopSettings => Set<TbShopSettings>();
    public DbSet<TbShopOperatingHour> ShopOperatingHours => Set<TbShopOperatingHour>();

    // Menu DbSets
    public DbSet<TbMenu> Menus => Set<TbMenu>();
    public DbSet<TbMenuSubCategory> MenuSubCategories => Set<TbMenuSubCategory>();
    public DbSet<TbOptionGroup> OptionGroups => Set<TbOptionGroup>();
    public DbSet<TbOptionItem> OptionItems => Set<TbOptionItem>();
    public DbSet<TbMenuOptionGroup> MenuOptionGroups => Set<TbMenuOptionGroup>();

    // Human Resource DbSets
    public DbSet<TbEmployee> Employees => Set<TbEmployee>();
    public DbSet<TbEmployeeAddress> EmployeeAddresses => Set<TbEmployeeAddress>();
    public DbSet<TbEmployeeEducation> EmployeeEducations => Set<TbEmployeeEducation>();
    public DbSet<TbEmployeeWorkHistory> EmployeeWorkHistories => Set<TbEmployeeWorkHistory>();

    // Table Management DbSets
    public DbSet<TbZone> Zones => Set<TbZone>();
    public DbSet<TbTable> Tables => Set<TbTable>();
    public DbSet<TbTableLink> TableLinks => Set<TbTableLink>();
    public DbSet<TbReservation> Reservations => Set<TbReservation>();
    public DbSet<TbFloorObject> FloorObjects => Set<TbFloorObject>();

    // Order Management DbSets
    public DbSet<TbOrder> Orders => Set<TbOrder>();
    public DbSet<TbOrderItem> OrderItems => Set<TbOrderItem>();
    public DbSet<TbOrderItemOption> OrderItemOptions => Set<TbOrderItemOption>();
    public DbSet<TbOrderBill> OrderBills => Set<TbOrderBill>();

    // Payment DbSets
    public DbSet<TbPayment> Payments => Set<TbPayment>();
    public DbSet<TbCashierSession> CashierSessions => Set<TbCashierSession>();
    public DbSet<TbCashDrawerTransaction> CashDrawerTransactions => Set<TbCashDrawerTransaction>();

    // Notification DbSets
    public DbSet<TbNotification> Notifications => Set<TbNotification>();
    public DbSet<TbNotificationRead> NotificationReads => Set<TbNotificationRead>();

    // Customer Self-Order DbSets
    public DbSet<TbCustomerSession> CustomerSessions => Set<TbCustomerSession>();

    // File Management DbSets
    public DbSet<TbFile> Files => Set<TbFile>();

    // Authorization DbSets
    public DbSet<TbmPosition> Positions => Set<TbmPosition>();
    public DbSet<TbmPermission> Permissions => Set<TbmPermission>();
    public DbSet<TbmModule> Modules => Set<TbmModule>();
    public DbSet<TbmAuthorizeMatrix> AuthorizeMatrices => Set<TbmAuthorizeMatrix>();
    public DbSet<TbAuthorizeMatrixPosition> AuthorizeMatrixPositions => Set<TbAuthorizeMatrixPosition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply Entity Configurations
        modelBuilder.ApplyConfiguration(new TbUserConfiguration());
        modelBuilder.ApplyConfiguration(new TbRefreshTokenConfiguration());
modelBuilder.ApplyConfiguration(new TbPasswordResetTokenConfiguration());
        modelBuilder.ApplyConfiguration(new TbPasswordHistoryConfiguration());
        modelBuilder.ApplyConfiguration(new TbServiceChargeConfiguration());
        modelBuilder.ApplyConfiguration(new TbShopSettingsConfiguration());
        modelBuilder.ApplyConfiguration(new TbShopOperatingHourConfiguration());
        modelBuilder.ApplyConfiguration(new TbMenuConfiguration());
        modelBuilder.ApplyConfiguration(new TbMenuSubCategoryConfiguration());
        modelBuilder.ApplyConfiguration(new TbOptionGroupConfiguration());
        modelBuilder.ApplyConfiguration(new TbOptionItemConfiguration());
        modelBuilder.ApplyConfiguration(new TbMenuOptionGroupConfiguration());
        modelBuilder.ApplyConfiguration(new TbEmployeeConfiguration());
        modelBuilder.ApplyConfiguration(new TbEmployeeAddressConfiguration());
        modelBuilder.ApplyConfiguration(new TbEmployeeEducationConfiguration());
        modelBuilder.ApplyConfiguration(new TbEmployeeWorkHistoryConfiguration());
        modelBuilder.ApplyConfiguration(new TbFileConfiguration());
        modelBuilder.ApplyConfiguration(new TbmPositionConfiguration());
        modelBuilder.ApplyConfiguration(new TbmPermissionConfiguration());
        modelBuilder.ApplyConfiguration(new TbmModuleConfiguration());
        modelBuilder.ApplyConfiguration(new TbmAuthorizeMatrixConfiguration());
        modelBuilder.ApplyConfiguration(new TbZoneConfiguration());
        modelBuilder.ApplyConfiguration(new TbTableConfiguration());
        modelBuilder.ApplyConfiguration(new TbTableLinkConfiguration());
        modelBuilder.ApplyConfiguration(new TbReservationConfiguration());
        modelBuilder.ApplyConfiguration(new TbFloorObjectConfiguration());
        modelBuilder.ApplyConfiguration(new TbOrderConfiguration());
        modelBuilder.ApplyConfiguration(new TbOrderItemConfiguration());
        modelBuilder.ApplyConfiguration(new TbOrderItemOptionConfiguration());
        modelBuilder.ApplyConfiguration(new TbOrderBillConfiguration());
        modelBuilder.ApplyConfiguration(new TbPaymentConfiguration());
        modelBuilder.ApplyConfiguration(new TbCashierSessionConfiguration());
        modelBuilder.ApplyConfiguration(new TbCashDrawerTransactionConfiguration());
        modelBuilder.ApplyConfiguration(new TbAuthorizeMatrixPositionConfiguration());
        modelBuilder.ApplyConfiguration(new TbNotificationConfiguration());
        modelBuilder.ApplyConfiguration(new TbNotificationReadConfiguration());
        modelBuilder.ApplyConfiguration(new TbCustomerSessionConfiguration());

        // Hard-delete entities — skip global query filter (DeleteFlag not used)
        var hardDeleteTypes = new HashSet<Type>
        {
            typeof(TbOptionGroup),
            typeof(TbOptionItem),
            typeof(TbMenuOptionGroup),
            typeof(TbTableLink)
        };

        // Global configuration for all BaseEntity-derived entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                // Query Filter — auto-filter DeleteFlag (skip for hard-delete entities)
                if (!hardDeleteTypes.Contains(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var deleteFlagProperty = Expression.Property(parameter, nameof(BaseEntity.DeleteFlag));
                    var filter = Expression.Lambda(
                        Expression.Equal(deleteFlagProperty, Expression.Constant(false)), parameter);
                    entityType.SetQueryFilter(filter);
                }

                // Audit navigation — CreatedBy → TbEmployee
                modelBuilder.Entity(entityType.ClrType)
                    .HasOne(typeof(TbEmployee), nameof(BaseEntity.CreatedByEmployee))
                    .WithMany()
                    .HasForeignKey(nameof(BaseEntity.CreatedBy))
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                // Audit navigation — UpdatedBy → TbEmployee
                modelBuilder.Entity(entityType.ClrType)
                    .HasOne(typeof(TbEmployee), nameof(BaseEntity.UpdatedByEmployee))
                    .WithMany()
                    .HasForeignKey(nameof(BaseEntity.UpdatedBy))
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            }
        }
    }

    public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken ct = default)
    {
        StampTrackingFields();
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, ct);
    }

    private void StampTrackingFields()
    {
        var now = DateTime.UtcNow;
        var userId = GetCurrentUserId();

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.CreatedBy = userId;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
                entry.Entity.UpdatedBy = userId;
            }

            if (entry.Entity.DeleteFlag && entry.Property(nameof(BaseEntity.DeleteFlag)).IsModified)
            {
                entry.Entity.DeletedAt = now;
                entry.Entity.DeletedBy = userId;
            }
        }
    }

    private int? GetCurrentUserId()
    {
        var claim = _httpContextAccessor?.HttpContext?.User?.FindFirst("employee_id")?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}
