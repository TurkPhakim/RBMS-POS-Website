using POS.Main.Business.Menu.Models;
using POS.Main.Core.Enums;

namespace POS.Main.Business.Menu.Interfaces;

/// <summary>
/// Interface for menu management
/// </summary>
public interface IMenuService
{
    /// <summary>
    /// Get all menus (excluding soft deleted)
    /// </summary>
    Task<IEnumerable<MenuResponseModel>> GetAllMenusAsync(CancellationToken ct = default);

    /// <summary>
    /// Get menu by ID
    /// </summary>
    Task<MenuResponseModel> GetMenuByIdAsync(int menuId, CancellationToken ct = default);

    /// <summary>
    /// Get menus by category
    /// </summary>
    Task<IEnumerable<MenuResponseModel>> GetMenusByCategoryAsync(EMenuCategory category, CancellationToken ct = default);

    /// <summary>
    /// Get available menus for ordering
    /// </summary>
    Task<IEnumerable<MenuResponseModel>> GetAvailableMenusAsync(CancellationToken ct = default);

    /// <summary>
    /// Search menus by name
    /// </summary>
    Task<IEnumerable<MenuResponseModel>> SearchMenusByNameAsync(string searchTerm, CancellationToken ct = default);

    /// <summary>
    /// Create new menu
    /// </summary>
    Task<MenuResponseModel> CreateMenuAsync(CreateMenuRequestModel request, int? imageFileId = null, CancellationToken ct = default);

    /// <summary>
    /// Update existing menu
    /// </summary>
    Task<MenuResponseModel> UpdateMenuAsync(int menuId, UpdateMenuRequestModel request, int? newImageFileId = null, CancellationToken ct = default);

    /// <summary>
    /// Soft delete menu
    /// </summary>
    Task DeleteMenuAsync(int menuId, CancellationToken ct = default);
}
