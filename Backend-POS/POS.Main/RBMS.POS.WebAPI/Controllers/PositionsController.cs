using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Business.Authorization.Models.Permission;
using POS.Main.Business.Authorization.Models.Position;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/admin/positions")]
public class PositionsController : BaseController
{
    private readonly IPositionService _positionService;
    private readonly IPermissionService _permissionService;

    public PositionsController(IPositionService positionService, IPermissionService permissionService)
    {
        _positionService = positionService;
        _permissionService = permissionService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Position.Read)]
    [ProducesResponseType(typeof(PaginationResult<PositionResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPositions([FromQuery] PaginationModel param, [FromQuery] bool? isActive, CancellationToken ct = default)
        => PagedSuccess(await _positionService.GetPositionsAsync(param, isActive, ct));

    [HttpGet("{positionId}")]
    [PermissionAuthorize(Permissions.Position.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<PositionResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPositionById(int positionId, CancellationToken ct = default)
        => Success(await _positionService.GetPositionByIdAsync(positionId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.Position.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<PositionResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePosition([FromBody] CreatePositionRequestModel request, CancellationToken ct = default)
        => Success(await _positionService.CreatePositionAsync(request, ct));

    [HttpPut("{positionId}")]
    [PermissionAuthorize(Permissions.Position.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<PositionResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePosition(int positionId, [FromBody] UpdatePositionRequestModel request, CancellationToken ct = default)
        => Success(await _positionService.UpdatePositionAsync(positionId, request, ct));

    [HttpDelete("{positionId}")]
    [PermissionAuthorize(Permissions.Position.Delete)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePosition(int positionId, CancellationToken ct = default)
    {
        await _positionService.DeletePositionAsync(positionId, ct);
        return Success("ลบตำแหน่งสำเร็จ");
    }

    [HttpGet("{positionId}/permissions")]
    [PermissionAuthorize(Permissions.Position.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<PermissionMatrixResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPositionPermissions(int positionId, CancellationToken ct = default)
        => Success(await _positionService.GetPositionPermissionsAsync(positionId, ct));

    [HttpPut("{positionId}/permissions")]
    [PermissionAuthorize(Permissions.Position.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePositionPermissions(int positionId, [FromBody] UpdatePermissionsRequestModel request, CancellationToken ct = default)
    {
        await _positionService.UpdatePositionPermissionsAsync(positionId, request, ct);
        return Success("อัพเดตสิทธิ์สำเร็จ");
    }

    [HttpGet("dropdown")]
    [ProducesResponseType(typeof(ListResponseModel<PositionDropdownModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPositionDropdown(CancellationToken ct = default)
        => ListSuccess(await _positionService.GetPositionDropdownAsync(ct));

    [HttpGet("modules/tree")]
    [PermissionAuthorize(Permissions.Position.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ModuleTreeResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModuleTree(CancellationToken ct = default)
        => Success(await _positionService.GetModuleTreeAsync(ct));

    [HttpGet("me/permissions")]
    [ProducesResponseType(typeof(ListResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPermissions(CancellationToken ct = default)
    {
        var employeeIdClaim = User.FindFirst("employee_id")?.Value;
        if (string.IsNullOrEmpty(employeeIdClaim) || !int.TryParse(employeeIdClaim, out var employeeId))
            return ListSuccess(Enumerable.Empty<string>());

        var positionIdClaim = User.FindFirst("position_id")?.Value;
        if (string.IsNullOrEmpty(positionIdClaim) || !int.TryParse(positionIdClaim, out var positionId))
            return ListSuccess(Enumerable.Empty<string>());

        var permissions = await _permissionService.GetPermissionsByPositionIdAsync(positionId, ct);
        return ListSuccess(permissions.AsEnumerable());
    }
}
