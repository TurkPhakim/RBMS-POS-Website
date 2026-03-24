using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.SubCategory;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/menu/categories")]
public class MenuCategoriesController : BaseController
{
    private readonly IMenuSubCategoryService _menuSubCategoryService;

    public MenuCategoriesController(IMenuSubCategoryService menuSubCategoryService)
    {
        _menuSubCategoryService = menuSubCategoryService;
    }

    [HttpGet("type/{categoryType}")]
    [PermissionAuthorize(Permissions.MenuCategory.Read)]
    [ProducesResponseType(typeof(PaginationResult<MenuSubCategoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubCategories(
        int categoryType, [FromQuery] PaginationModel param, CancellationToken ct = default)
        => PagedSuccess(await _menuSubCategoryService.GetSubCategoriesAsync(categoryType, param, ct));

    [HttpGet("{subCategoryId}")]
    [PermissionAuthorize(Permissions.MenuCategory.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuSubCategoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubCategory(int subCategoryId, CancellationToken ct = default)
        => Success(await _menuSubCategoryService.GetSubCategoryByIdAsync(subCategoryId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.MenuCategory.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuSubCategoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateSubCategory(
        [FromBody] CreateMenuSubCategoryRequestModel request, CancellationToken ct = default)
        => Success(await _menuSubCategoryService.CreateSubCategoryAsync(request, ct));

    [HttpPut("{subCategoryId}")]
    [PermissionAuthorize(Permissions.MenuCategory.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<MenuSubCategoryResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSubCategory(
        int subCategoryId, [FromBody] UpdateMenuSubCategoryRequestModel request, CancellationToken ct = default)
        => Success(await _menuSubCategoryService.UpdateSubCategoryAsync(subCategoryId, request, ct));

    [HttpDelete("{subCategoryId}")]
    [PermissionAuthorize(Permissions.MenuCategory.Delete)]
    public async Task<IActionResult> DeleteSubCategory(int subCategoryId, CancellationToken ct = default)
    {
        await _menuSubCategoryService.DeleteSubCategoryAsync(subCategoryId, ct);
        return Success("ลบหมวดหมู่สำเร็จ");
    }

    [HttpPut("sort-order")]
    [PermissionAuthorize(Permissions.MenuCategory.Update)]
    public async Task<IActionResult> UpdateSortOrder(
        [FromBody] UpdateSortOrderRequestModel request, CancellationToken ct = default)
    {
        await _menuSubCategoryService.UpdateSortOrderAsync(request, ct);
        return Success("อัพเดตลำดับสำเร็จ");
    }
}
