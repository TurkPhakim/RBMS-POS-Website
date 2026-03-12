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
    public DbSet<TbLoginHistory> LoginHistory => Set<TbLoginHistory>();

    // Admin Settings DbSets
    public DbSet<TbServiceCharge> ServiceCharges => Set<TbServiceCharge>();

    // Menu DbSets
    public DbSet<TbMenu> Menus => Set<TbMenu>();

    // Human Resource DbSets
    public DbSet<TbEmployee> Employees => Set<TbEmployee>();

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
        modelBuilder.ApplyConfiguration(new TbLoginHistoryConfiguration());
        modelBuilder.ApplyConfiguration(new TbServiceChargeConfiguration());
        modelBuilder.ApplyConfiguration(new TbMenuConfiguration());
        modelBuilder.ApplyConfiguration(new TbEmployeeConfiguration());
        modelBuilder.ApplyConfiguration(new TbFileConfiguration());
        modelBuilder.ApplyConfiguration(new TbmPositionConfiguration());
        modelBuilder.ApplyConfiguration(new TbmPermissionConfiguration());
        modelBuilder.ApplyConfiguration(new TbmModuleConfiguration());
        modelBuilder.ApplyConfiguration(new TbmAuthorizeMatrixConfiguration());
        modelBuilder.ApplyConfiguration(new TbAuthorizeMatrixPositionConfiguration());

        // Global configuration for all BaseEntity-derived entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                // Query Filter — auto-filter DeleteFlag
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var deleteFlagProperty = Expression.Property(parameter, nameof(BaseEntity.DeleteFlag));
                var filter = Expression.Lambda(
                    Expression.Equal(deleteFlagProperty, Expression.Constant(false)), parameter);
                entityType.SetQueryFilter(filter);

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
