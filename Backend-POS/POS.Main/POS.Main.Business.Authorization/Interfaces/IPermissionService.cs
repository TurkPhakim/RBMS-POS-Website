namespace POS.Main.Business.Authorization.Interfaces;

public interface IPermissionService
{
    Task<bool> HasAnyPermissionAsync(int employeeId, string[] permissions, CancellationToken ct = default);
    Task<HashSet<string>> GetPermissionsByPositionIdAsync(int positionId, CancellationToken ct = default);
    void InvalidatePositionCache(int positionId);
}
