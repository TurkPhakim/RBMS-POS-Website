using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.MenuItem;
using POS.Main.Core.Constants;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/menu/items")]
public class MenuItemsController : BaseController
{
    private readonly IMenuService _menuService;
    private readonly IFileService _fileService;
    private readonly IPermissionService _permissionService;

    public MenuItemsController(IMenuService menuService, IFileService fileService, IPermissionService permissionService)
    {
        _menuService = menuService;
        _fileService = fileService;
        _permissionService = permissionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginationResult<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenus(
        [FromQuery] int? categoryType,
        [FromQuery] int? subCategoryId,
        [FromQuery] string? search,
        [FromQuery] bool? isAvailable,
        [FromQuery] string? period,
        [FromQuery] PaginationModel param,
        CancellationToken ct = default)
    {
        if (categoryType.HasValue)
            await CheckCategoryPermissionAsync(categoryType.Value, "read", ct);
        else
            await CheckAnyCategoryReadPermissionAsync(ct);

        return PagedSuccess(await _menuService.GetMenusAsync(categoryType, subCategoryId, search, isAvailable, period, param, ct));
    }

    [HttpGet("{menuId}")]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenu(int menuId, CancellationToken ct = default)
    {
        var catType = await _menuService.GetMenuCategoryTypeAsync(menuId, ct);
        await CheckCategoryPermissionAsync(catType, "read", ct);
        return Success(await _menuService.GetMenuByIdAsync(menuId, ct));
    }

    [HttpPost]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateMenu(
        [FromForm] CreateMenuRequestModel request,
        IFormFile? imageFile,
        CancellationToken ct = default)
    {
        var catType = await _menuService.GetCategoryTypeBySubCategoryIdAsync(request.SubCategoryId, ct);
        await CheckCategoryPermissionAsync(catType, "create", ct);

        int? imageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            imageFileId = fileResult.FileId;
        }

        return Success(await _menuService.CreateMenuAsync(request, imageFileId, ct));
    }

    [HttpPut("{menuId}")]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateMenu(
        int menuId,
        [FromForm] UpdateMenuRequestModel request,
        IFormFile? imageFile,
        CancellationToken ct = default)
    {
        var catType = await _menuService.GetMenuCategoryTypeAsync(menuId, ct);
        await CheckCategoryPermissionAsync(catType, "update", ct);

        int? newImageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            newImageFileId = fileResult.FileId;
        }

        return Success(await _menuService.UpdateMenuAsync(menuId, request, newImageFileId, ct));
    }

    [HttpDelete("{menuId}")]
    public async Task<IActionResult> DeleteMenu(int menuId, CancellationToken ct = default)
    {
        var catType = await _menuService.GetMenuCategoryTypeAsync(menuId, ct);
        await CheckCategoryPermissionAsync(catType, "delete", ct);

        await _menuService.DeleteMenuAsync(menuId, ct);
        return Success("ลบเมนูสำเร็จ");
    }

    private static string GetCategoryPermission(int categoryType, string action) => categoryType switch
    {
        1 => $"menu-food.{action}",
        2 => $"menu-beverage.{action}",
        3 => $"menu-dessert.{action}",
        _ => throw new ValidationException("ประเภทเมนูไม่ถูกต้อง")
    };

    private async Task CheckCategoryPermissionAsync(int categoryType, string action, CancellationToken ct)
    {
        var employeeId = int.Parse(User.FindFirst("employee_id")!.Value);
        var perm = GetCategoryPermission(categoryType, action);
        if (!await _permissionService.HasAnyPermissionAsync(employeeId, [perm], ct))
            throw new ForbiddenException("ไม่มีสิทธิ์เข้าถึงเมนูประเภทนี้");
    }

    private async Task CheckAnyCategoryReadPermissionAsync(CancellationToken ct)
    {
        var employeeId = int.Parse(User.FindFirst("employee_id")!.Value);
        var perms = new[]
        {
            Permissions.MenuFood.Read,
            Permissions.MenuBeverage.Read,
            Permissions.MenuDessert.Read
        };
        if (!await _permissionService.HasAnyPermissionAsync(employeeId, perms, ct))
            throw new ForbiddenException("ไม่มีสิทธิ์เข้าถึงเมนู");
    }
}
