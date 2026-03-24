using POS.Main.Business.Menu.Models.MenuItem;
using POS.Main.Core.Models;

namespace POS.Main.Business.Menu.Interfaces;

public interface IMenuService
{
    Task<PaginationResult<MenuResponseModel>> GetMenusAsync(
        int? categoryType, int? subCategoryId, string? search,
        bool? isAvailable, string? period, PaginationModel param, CancellationToken ct = default);

    Task<MenuResponseModel> GetMenuByIdAsync(int menuId, CancellationToken ct = default);

    Task<MenuResponseModel> CreateMenuAsync(
        CreateMenuRequestModel request, int? imageFileId = null, CancellationToken ct = default);

    Task<MenuResponseModel> UpdateMenuAsync(
        int menuId, UpdateMenuRequestModel request, int? newImageFileId = null, CancellationToken ct = default);

    Task DeleteMenuAsync(int menuId, CancellationToken ct = default);

    Task<int> GetMenuCategoryTypeAsync(int menuId, CancellationToken ct = default);
    Task<int> GetCategoryTypeBySubCategoryIdAsync(int subCategoryId, CancellationToken ct = default);
}
