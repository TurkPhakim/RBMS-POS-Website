using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Authorization.Services;

public class PermissionService : IPermissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _memoryCache;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<PermissionService> _logger;

    private const string CacheKeyPrefix = "position_permissions_";
    private const string RequestCacheKey = "employee_permissions";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public PermissionService(
        IUnitOfWork unitOfWork,
        IMemoryCache memoryCache,
        IHttpContextAccessor httpContextAccessor,
        ILogger<PermissionService> logger)
    {
        _unitOfWork = unitOfWork;
        _memoryCache = memoryCache;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<bool> HasAnyPermissionAsync(int employeeId, string[] permissions, CancellationToken ct = default)
    {
        var userPermissions = await GetEmployeePermissionsAsync(employeeId, ct);
        return permissions.Any(p => userPermissions.Contains(p));
    }

    public async Task<HashSet<string>> GetPermissionsByPositionIdAsync(int positionId, CancellationToken ct = default)
    {
        var cacheKey = $"{CacheKeyPrefix}{positionId}";

        if (_memoryCache.TryGetValue(cacheKey, out HashSet<string>? cached) && cached != null)
            return cached;

        var permissions = await _unitOfWork.AuthorizeMatrixPositions
            .GetPermissionPathsByPositionIdAsync(positionId, ct);

        _memoryCache.Set(cacheKey, permissions, CacheDuration);

        return permissions;
    }

    public void InvalidatePositionCache(int positionId)
    {
        var cacheKey = $"{CacheKeyPrefix}{positionId}";
        _memoryCache.Remove(cacheKey);
        _logger.LogInformation("Permission cache invalidated for position {PositionId}", positionId);
    }

    private async Task<HashSet<string>> GetEmployeePermissionsAsync(int employeeId, CancellationToken ct)
    {
        // L1: Request-scoped cache
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.Items.TryGetValue(RequestCacheKey, out var requestCached) == true
            && requestCached is HashSet<string> l1Cached)
        {
            return l1Cached;
        }

        // Get employee's positionId
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        if (employee?.PositionId == null)
            return new HashSet<string>();

        // L2: IMemoryCache (10 min)
        var permissions = await GetPermissionsByPositionIdAsync(employee.PositionId.Value, ct);

        // Store in L1 for this request
        if (httpContext != null)
            httpContext.Items[RequestCacheKey] = permissions;

        return permissions;
    }
}
