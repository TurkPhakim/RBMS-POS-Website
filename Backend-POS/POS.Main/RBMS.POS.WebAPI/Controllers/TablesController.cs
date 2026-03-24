using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Table;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/table/tables")]
public class TablesController : BaseController
{
    private readonly ITableService _tableService;

    public TablesController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(PaginationResult<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTables(
        [FromQuery] int? zoneId, [FromQuery] string? status,
        [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _tableService.GetTablesAsync(zoneId, status, param, ct));

    [HttpGet("{tableId}")]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTable(int tableId, CancellationToken ct = default)
        => Success(await _tableService.GetTableByIdAsync(tableId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.Table.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateTable(
        [FromBody] CreateTableRequestModel request, CancellationToken ct = default)
        => Success(await _tableService.CreateTableAsync(request, ct));

    [HttpPut("{tableId}")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateTable(
        int tableId, [FromBody] UpdateTableRequestModel request, CancellationToken ct = default)
        => Success(await _tableService.UpdateTableAsync(tableId, request, ct));

    [HttpDelete("{tableId}")]
    [PermissionAuthorize(Permissions.Table.Delete)]
    public async Task<IActionResult> DeleteTable(int tableId, CancellationToken ct = default)
    {
        await _tableService.DeleteTableAsync(tableId, ct);
        return Success("ลบโต๊ะสำเร็จ");
    }

    [HttpPut("positions")]
    [PermissionAuthorize(Permissions.Table.Update)]
    public async Task<IActionResult> UpdatePositions(
        [FromBody] UpdateTablePositionsRequestModel request, CancellationToken ct = default)
    {
        await _tableService.UpdatePositionsAsync(request, ct);
        return Success("อัพเดตตำแหน่งสำเร็จ");
    }

    [HttpPost("{tableId}/open")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> OpenTable(
        int tableId, [FromBody] OpenTableRequestModel request, CancellationToken ct = default)
        => Success(await _tableService.OpenTableAsync(tableId, request, ct));

    [HttpPost("{tableId}/close")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CloseTable(int tableId, CancellationToken ct = default)
        => Success(await _tableService.CloseTableAsync(tableId, ct));

    [HttpPost("{tableId}/clean")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CleanTable(int tableId, CancellationToken ct = default)
        => Success(await _tableService.CleanTableAsync(tableId, ct));

    [HttpPost("{tableId}/move")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MoveTable(
        int tableId, [FromBody] MoveTableRequestModel request, CancellationToken ct = default)
        => Success(await _tableService.MoveTableAsync(tableId, request, ct));

    [HttpPost("link")]
    [PermissionAuthorize(Permissions.Table.Update)]
    public async Task<IActionResult> LinkTables(
        [FromBody] LinkTablesRequestModel request, CancellationToken ct = default)
    {
        await _tableService.LinkTablesAsync(request, ct);
        return Success("เชื่อมโต๊ะสำเร็จ");
    }

    [HttpDelete("link/{groupCode}")]
    [PermissionAuthorize(Permissions.Table.Update)]
    public async Task<IActionResult> UnlinkTables(string groupCode, CancellationToken ct = default)
    {
        await _tableService.UnlinkTablesAsync(groupCode, ct);
        return Success("ยกเลิกเชื่อมโต๊ะสำเร็จ");
    }

    [HttpPost("{tableId}/set-unavailable")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetUnavailable(int tableId, CancellationToken ct = default)
        => Success(await _tableService.SetUnavailableAsync(tableId, ct));

    [HttpPost("{tableId}/set-available")]
    [PermissionAuthorize(Permissions.Table.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<TableResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetAvailable(int tableId, CancellationToken ct = default)
        => Success(await _tableService.SetAvailableAsync(tableId, ct));

    [HttpGet("{tableId}/qr-token")]
    [PermissionAuthorize(Permissions.Table.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetQrToken(int tableId, CancellationToken ct = default)
        => Success<string?>(await _tableService.GetQrTokenAsync(tableId, ct));
}
