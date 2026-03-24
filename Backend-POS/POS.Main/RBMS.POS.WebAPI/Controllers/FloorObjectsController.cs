using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.FloorObject;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/table/floor-objects")]
public class FloorObjectsController : BaseController
{
    private readonly IFloorObjectService _floorObjectService;

    public FloorObjectsController(IFloorObjectService floorObjectService)
    {
        _floorObjectService = floorObjectService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.FloorPlan.Read)]
    [ProducesResponseType(typeof(ListResponseModel<FloorObjectResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFloorObjects(
        [FromQuery] int? zoneId, CancellationToken ct = default)
        => ListSuccess(await _floorObjectService.GetFloorObjectsAsync(zoneId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.FloorPlan.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<FloorObjectResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateFloorObject(
        [FromBody] CreateFloorObjectRequestModel request, CancellationToken ct = default)
        => Success(await _floorObjectService.CreateFloorObjectAsync(request, ct));

    [HttpPut("{floorObjectId}")]
    [PermissionAuthorize(Permissions.FloorPlan.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<FloorObjectResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateFloorObject(
        int floorObjectId, [FromBody] UpdateFloorObjectRequestModel request, CancellationToken ct = default)
        => Success(await _floorObjectService.UpdateFloorObjectAsync(floorObjectId, request, ct));

    [HttpDelete("{floorObjectId}")]
    [PermissionAuthorize(Permissions.FloorPlan.Delete)]
    public async Task<IActionResult> DeleteFloorObject(
        int floorObjectId, CancellationToken ct = default)
    {
        await _floorObjectService.DeleteFloorObjectAsync(floorObjectId, ct);
        return Success("ลบวัตถุสำเร็จ");
    }

    [HttpPut("positions")]
    [PermissionAuthorize(Permissions.FloorPlan.Update)]
    public async Task<IActionResult> UpdatePositions(
        [FromBody] UpdateFloorObjectPositionsRequestModel request, CancellationToken ct = default)
    {
        await _floorObjectService.UpdatePositionsAsync(request, ct);
        return Success("อัพเดตตำแหน่งสำเร็จ");
    }
}
