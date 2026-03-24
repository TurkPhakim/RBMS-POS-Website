using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Business.Authorization.Models.Permission;
using POS.Main.Business.Authorization.Models.Position;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Authorization.Services;

public class PositionService : IPositionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PositionService> _logger;

    public PositionService(
        IUnitOfWork unitOfWork,
        IPermissionService permissionService,
        ILogger<PositionService> logger)
    {
        _unitOfWork = unitOfWork;
        _permissionService = permissionService;
        _logger = logger;
    }

    public async Task<PaginationResult<PositionResponseModel>> GetPositionsAsync(PaginationModel param, bool? isActive = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.Positions.QueryNoTracking()
            .Include(p => p.CreatedByEmployee)
            .Include(p => p.UpdatedByEmployee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(p => p.PositionName.ToLower().Contains(term));
        }

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(p => p.PositionId)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<PositionResponseModel>
        {
            Results = items.Select(PositionMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<PositionResponseModel> GetPositionByIdAsync(int positionId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Positions.QueryNoTracking()
            .Include(p => p.CreatedByEmployee)
            .Include(p => p.UpdatedByEmployee)
            .FirstOrDefaultAsync(p => p.PositionId == positionId, ct)
            ?? throw new EntityNotFoundException("Position", positionId);

        return PositionMapper.ToResponse(entity);
    }

    public async Task<PositionResponseModel> CreatePositionAsync(CreatePositionRequestModel request, CancellationToken ct = default)
    {
        var nameExists = await _unitOfWork.Positions.IsNameExistsAsync(request.PositionName, ct: ct);
        if (nameExists)
            throw new ValidationException($"ชื่อตำแหน่ง '{request.PositionName}' มีอยู่แล้ว");

        var entity = PositionMapper.ToEntity(request);

        await _unitOfWork.Positions.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        // Grant all permissions by default for new positions
        await GrantAllPermissionsAsync(entity.PositionId, ct);

        _logger.LogInformation("Position created: {PositionId} - {PositionName}", entity.PositionId, entity.PositionName);

        return PositionMapper.ToResponse(entity);
    }

    public async Task<PositionResponseModel> UpdatePositionAsync(int positionId, UpdatePositionRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Positions.GetByIdAsync(positionId, ct)
            ?? throw new EntityNotFoundException("Position", positionId);

        var nameExists = await _unitOfWork.Positions.IsNameExistsAsync(request.PositionName, positionId, ct);
        if (nameExists)
            throw new ValidationException($"ชื่อตำแหน่ง '{request.PositionName}' มีอยู่แล้ว");

        PositionMapper.UpdateEntity(entity, request);

        _unitOfWork.Positions.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Position updated: {PositionId}", positionId);

        return PositionMapper.ToResponse(entity);
    }

    public async Task DeletePositionAsync(int positionId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Positions.GetByIdAsync(positionId, ct)
            ?? throw new EntityNotFoundException("Position", positionId);

        var hasEmployees = await _unitOfWork.Employees.ExistsAsync(e => e.PositionId == positionId, ct);
        if (hasEmployees)
            throw new ValidationException("ไม่สามารถลบตำแหน่งได้\nเนื่องจากมีพนักงานใช้งานอยู่");

        entity.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _permissionService.InvalidatePositionCache(positionId);
        _logger.LogInformation("Position deleted: {PositionId}", positionId);
    }

    public async Task<PermissionMatrixResponseModel> GetPositionPermissionsAsync(int positionId, CancellationToken ct = default)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(positionId, ct)
            ?? throw new EntityNotFoundException("Position", positionId);

        var grantedEntries = await _unitOfWork.AuthorizeMatrixPositions.GetByPositionIdAsync(positionId, ct);
        var grantedIds = grantedEntries.Select(e => e.AuthorizeMatrixId).ToList();

        var moduleTree = await BuildModuleTreeAsync(ct);

        return new PermissionMatrixResponseModel
        {
            PositionId = position.PositionId,
            PositionName = position.PositionName,
            GrantedAuthorizeMatrixIds = grantedIds,
            ModuleTree = moduleTree
        };
    }

    public async Task UpdatePositionPermissionsAsync(int positionId, UpdatePermissionsRequestModel request, CancellationToken ct = default)
    {
        var position = await _unitOfWork.Positions.GetByIdAsync(positionId, ct)
            ?? throw new EntityNotFoundException("Position", positionId);

        await _unitOfWork.AuthorizeMatrixPositions
            .ReplacePermissionsForPositionAsync(positionId, request.AuthorizeMatrixIds, ct);
        await _unitOfWork.CommitAsync(ct);

        _permissionService.InvalidatePositionCache(positionId);
        _logger.LogInformation("Permissions updated for position {PositionId} - {PositionName}", positionId, position.PositionName);
    }

    public async Task<List<PositionDropdownModel>> GetPositionDropdownAsync(CancellationToken ct = default)
    {
        var positions = await _unitOfWork.Positions.GetAllActiveAsync(ct);
        return positions.Where(p => p.IsActive).Select(PositionMapper.ToDropdown).ToList();
    }

    public async Task<ModuleTreeResponseModel> GetModuleTreeAsync(CancellationToken ct = default)
    {
        return await BuildModuleTreeAsync(ct);
    }

    private async Task<ModuleTreeResponseModel> BuildModuleTreeAsync(CancellationToken ct)
    {
        var modules = await _unitOfWork.Modules.GetModuleTreeAsync(ct);
        var matrices = await _unitOfWork.AuthorizeMatrices.GetAllWithDetailsAsync(ct);

        var matrixLookup = matrices
            .GroupBy(am => am.ModuleId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new ModuleTreeResponseModel
        {
            Modules = modules.Select(parent => new ModuleNode
            {
                ModuleId = parent.ModuleId,
                ModuleName = parent.ModuleName,
                ModuleCode = parent.ModuleCode,
                SortOrder = parent.SortOrder,
                Children = parent.ChildModules.Select(child => new ChildModuleNode
                {
                    ModuleId = child.ModuleId,
                    ModuleName = child.ModuleName,
                    ModuleCode = child.ModuleCode,
                    SortOrder = child.SortOrder,
                    Permissions = matrixLookup.TryGetValue(child.ModuleId, out var perms)
                        ? perms.Select(am => new PermissionItem
                        {
                            AuthorizeMatrixId = am.AuthorizeMatrixId,
                            PermissionPath = am.PermissionPath,
                            PermissionName = am.Permission.PermissionName,
                            PermissionCode = am.Permission.PermissionCode
                        }).ToList()
                        : new List<PermissionItem>()
                }).ToList()
            }).ToList()
        };

        return result;
    }

    private async Task GrantAllPermissionsAsync(int positionId, CancellationToken ct)
    {
        var allMatrices = await _unitOfWork.AuthorizeMatrices.GetAllWithDetailsAsync(ct);
        var allMatrixIds = allMatrices.Select(am => am.AuthorizeMatrixId).ToList();

        await _unitOfWork.AuthorizeMatrixPositions
            .ReplacePermissionsForPositionAsync(positionId, allMatrixIds, ct);
        await _unitOfWork.CommitAsync(ct);
    }
}
