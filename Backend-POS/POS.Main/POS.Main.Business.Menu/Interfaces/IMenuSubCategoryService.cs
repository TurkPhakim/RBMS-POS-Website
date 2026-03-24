using POS.Main.Business.Menu.Models.SubCategory;
using POS.Main.Core.Models;

namespace POS.Main.Business.Menu.Interfaces;

public interface IMenuSubCategoryService
{
    Task<PaginationResult<MenuSubCategoryResponseModel>> GetSubCategoriesAsync(
        int categoryType, PaginationModel param, CancellationToken ct = default);

    Task<MenuSubCategoryResponseModel> GetSubCategoryByIdAsync(
        int subCategoryId, CancellationToken ct = default);

    Task<MenuSubCategoryResponseModel> CreateSubCategoryAsync(
        CreateMenuSubCategoryRequestModel request, CancellationToken ct = default);

    Task<MenuSubCategoryResponseModel> UpdateSubCategoryAsync(
        int subCategoryId, UpdateMenuSubCategoryRequestModel request, CancellationToken ct = default);

    Task DeleteSubCategoryAsync(int subCategoryId, CancellationToken ct = default);

    Task UpdateSortOrderAsync(UpdateSortOrderRequestModel request, CancellationToken ct = default);
}
