using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Zone;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/table/zones")]
public class ZonesController : BaseController
{
    private readonly IZoneService _zoneService;

    public ZonesController(IZoneService zoneService)
    {
        _zoneService = zoneService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(PaginationResult<ZoneResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetZones(
        [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _zoneService.GetZonesAsync(param, ct));

    [HttpGet("{zoneId}")]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ZoneResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetZone(int zoneId, CancellationToken ct = default)
        => Success(await _zoneService.GetZoneByIdAsync(zoneId, ct));

    [HttpGet("active")]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(ListResponseModel<ZoneResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveZones(CancellationToken ct = default)
        => ListSuccess(await _zoneService.GetActiveZonesAsync(ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.Table.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<ZoneResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateZone(
        [FromBody] CreateZoneRequestModel request, CancellationToken ct = default)
        => Success(await _zoneService.CreateZoneAsync(request, ct));

    [HttpPut("{zoneId}")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ZoneResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateZone(
        int zoneId, [FromBody] UpdateZoneRequestModel request, CancellationToken ct = default)
        => Success(await _zoneService.UpdateZoneAsync(zoneId, request, ct));

    [HttpDelete("{zoneId}")]
    [PermissionAuthorize(Permissions.Table.Delete)]
    public async Task<IActionResult> DeleteZone(int zoneId, CancellationToken ct = default)
    {
        await _zoneService.DeleteZoneAsync(zoneId, ct);
        return Success("ลบโซนสำเร็จ");
    }

    [HttpPut("sort-order")]
    [PermissionAuthorize(Permissions.Table.Update)]
    public async Task<IActionResult> UpdateSortOrder(
        [FromBody] UpdateZoneSortOrderRequestModel request, CancellationToken ct = default)
    {
        await _zoneService.UpdateSortOrderAsync(request, ct);
        return Success("อัพเดตลำดับสำเร็จ");
    }
}
