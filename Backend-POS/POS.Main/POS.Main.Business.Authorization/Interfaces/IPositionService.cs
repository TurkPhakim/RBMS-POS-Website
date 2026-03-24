using POS.Main.Business.Authorization.Models.Permission;
using POS.Main.Business.Authorization.Models.Position;
using POS.Main.Core.Models;

namespace POS.Main.Business.Authorization.Interfaces;

public interface IPositionService
{
    Task<PaginationResult<PositionResponseModel>> GetPositionsAsync(PaginationModel param, bool? isActive = null, CancellationToken ct = default);
    Task<PositionResponseModel> GetPositionByIdAsync(int positionId, CancellationToken ct = default);
    Task<PositionResponseModel> CreatePositionAsync(CreatePositionRequestModel request, CancellationToken ct = default);
    Task<PositionResponseModel> UpdatePositionAsync(int positionId, UpdatePositionRequestModel request, CancellationToken ct = default);
    Task DeletePositionAsync(int positionId, CancellationToken ct = default);
    Task<PermissionMatrixResponseModel> GetPositionPermissionsAsync(int positionId, CancellationToken ct = default);
    Task UpdatePositionPermissionsAsync(int positionId, UpdatePermissionsRequestModel request, CancellationToken ct = default);
    Task<List<PositionDropdownModel>> GetPositionDropdownAsync(CancellationToken ct = default);
    Task<ModuleTreeResponseModel> GetModuleTreeAsync(CancellationToken ct = default);
}
