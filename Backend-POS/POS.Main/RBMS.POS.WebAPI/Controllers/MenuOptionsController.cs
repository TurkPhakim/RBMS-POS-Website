using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.OptionGroup;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/menu/options")]
public class MenuOptionsController : BaseController
{
    private readonly IOptionGroupService _optionGroupService;

    public MenuOptionsController(IOptionGroupService optionGroupService)
    {
        _optionGroupService = optionGroupService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.MenuOption.Read)]
    [ProducesResponseType(typeof(PaginationResult<OptionGroupResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOptionGroups(
        [FromQuery] int? categoryType, [FromQuery] bool? isActive,
        [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _optionGroupService.GetOptionGroupsAsync(param, categoryType, isActive, ct));

    [HttpGet("type/{categoryType}")]
    [PermissionAuthorize(Permissions.MenuOption.Read)]
    [ProducesResponseType(typeof(PaginationResult<OptionGroupResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOptionGroups(
        int categoryType, [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _optionGroupService.GetOptionGroupsAsync(categoryType, param, ct));

    [HttpGet("{optionGroupId}")]
    [PermissionAuthorize(Permissions.MenuOption.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<OptionGroupResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOptionGroup(int optionGroupId, CancellationToken ct = default)
        => Success(await _optionGroupService.GetOptionGroupByIdAsync(optionGroupId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.MenuOption.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<OptionGroupResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateOptionGroup(
        [FromBody] CreateOptionGroupRequestModel request, CancellationToken ct = default)
        => Success(await _optionGroupService.CreateOptionGroupAsync(request, ct));

    [HttpPut("{optionGroupId}")]
    [PermissionAuthorize(Permissions.MenuOption.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<OptionGroupResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateOptionGroup(
        int optionGroupId, [FromBody] UpdateOptionGroupRequestModel request, CancellationToken ct = default)
        => Success(await _optionGroupService.UpdateOptionGroupAsync(optionGroupId, request, ct));

    [HttpDelete("{optionGroupId}")]
    [PermissionAuthorize(Permissions.MenuOption.Delete)]
    public async Task<IActionResult> DeleteOptionGroup(int optionGroupId, CancellationToken ct = default)
    {
        await _optionGroupService.DeleteOptionGroupAsync(optionGroupId, ct);
        return Success("ลบกลุ่มตัวเลือกสำเร็จ");
    }
}
