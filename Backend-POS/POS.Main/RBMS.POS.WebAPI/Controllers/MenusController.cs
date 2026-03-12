using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Business.Menu.Models;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Core.Constants;
using POS.Main.Core.Enums;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

/// <summary>
/// Menu management endpoints
/// </summary>
[Authorize]
[Route("api/menu")]
public class MenusController : BaseController
{
    private readonly IMenuService _menuService;
    private readonly IFileService _fileService;

    public MenusController(IMenuService menuService, IFileService fileService)
    {
        _menuService = menuService;
        _fileService = fileService;
    }

    /// <summary>
    /// Get all menus
    /// </summary>
    [HttpGet]
    [PermissionAuthorize(Permissions.Menu.Read)]
    [ProducesResponseType(typeof(ListResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
        => ListSuccess(await _menuService.GetAllMenusAsync(ct));

    /// <summary>
    /// Get menu by ID
    /// </summary>
    [HttpGet("{menuId}")]
    [PermissionAuthorize(Permissions.Menu.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int menuId, CancellationToken ct = default)
        => Success(await _menuService.GetMenuByIdAsync(menuId, ct));

    /// <summary>
    /// Get menus by category
    /// </summary>
    [HttpGet("category/{category}")]
    [PermissionAuthorize(Permissions.Menu.Read)]
    [ProducesResponseType(typeof(ListResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategory(EMenuCategory category, CancellationToken ct = default)
        => ListSuccess(await _menuService.GetMenusByCategoryAsync(category, ct));

    /// <summary>
    /// Get available menus for ordering
    /// </summary>
    [HttpGet("available")]
    [PermissionAuthorize(Permissions.Menu.Read)]
    [ProducesResponseType(typeof(ListResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailable(CancellationToken ct = default)
        => ListSuccess(await _menuService.GetAvailableMenusAsync(ct));

    /// <summary>
    /// Search menus by name
    /// </summary>
    [HttpGet("search")]
    [PermissionAuthorize(Permissions.Menu.Read)]
    [ProducesResponseType(typeof(ListResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string searchTerm, CancellationToken ct = default)
        => ListSuccess(await _menuService.SearchMenusByNameAsync(searchTerm, ct));

    /// <summary>
    /// Create a new menu
    /// </summary>
    [HttpPost]
    [PermissionAuthorize(Permissions.Menu.Create)]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromForm] CreateMenuRequestModel request, IFormFile? imageFile, CancellationToken ct = default)
    {
        int? imageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            imageFileId = fileResult.FileId;
        }

        var result = await _menuService.CreateMenuAsync(request, imageFileId, ct);
        return Success(result);
    }

    /// <summary>
    /// Update an existing menu
    /// </summary>
    [HttpPut("{menuId}")]
    [PermissionAuthorize(Permissions.Menu.Update)]
    [RequestSizeLimit(10_485_760)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int menuId, [FromForm] UpdateMenuRequestModel request, IFormFile? imageFile, CancellationToken ct = default)
    {
        int? newImageFileId = null;
        if (imageFile != null)
        {
            var fileResult = await _fileService.UploadAsync(imageFile, ct);
            newImageFileId = fileResult.FileId;
        }

        var result = await _menuService.UpdateMenuAsync(menuId, request, newImageFileId, ct);
        return Success(result);
    }

    /// <summary>
    /// Delete a menu (soft delete)
    /// </summary>
    [HttpDelete("{menuId}")]
    [PermissionAuthorize(Permissions.Menu.Delete)]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int menuId, CancellationToken ct = default)
    {
        await _menuService.DeleteMenuAsync(menuId, ct);
        return Success("Menu deleted successfully");
    }
}
