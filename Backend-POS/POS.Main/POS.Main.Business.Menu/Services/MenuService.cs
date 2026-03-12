using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Menu.Services;

public class MenuService : IMenuService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MenuService> _logger;

    public MenuService(IUnitOfWork unitOfWork, ILogger<MenuService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<MenuResponseModel>> GetAllMenusAsync(CancellationToken ct = default)
    {
        var menus = await _unitOfWork.Menus.GetAllActiveAsync(ct);
        return menus.Select(MenuMapper.ToResponse);
    }

    public async Task<MenuResponseModel> GetMenuByIdAsync(int menuId, CancellationToken ct = default)
    {
        var menu = await _unitOfWork.Menus.GetAll()
            .AsNoTracking()
            .Include(m => m.ImageFile)
            .Include(m => m.CreatedByEmployee)
            .Include(m => m.UpdatedByEmployee)
            .FirstOrDefaultAsync(m => m.MenuId == menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        return MenuMapper.ToResponse(menu);
    }

    public async Task<IEnumerable<MenuResponseModel>> GetMenusByCategoryAsync(EMenuCategory category, CancellationToken ct = default)
    {
        var menus = await _unitOfWork.Menus.GetByCategoryAsync(category, ct);
        return menus.Select(MenuMapper.ToResponse);
    }

    public async Task<IEnumerable<MenuResponseModel>> GetAvailableMenusAsync(CancellationToken ct = default)
    {
        var menus = await _unitOfWork.Menus.GetAvailableMenusAsync(ct);
        return menus.Select(MenuMapper.ToResponse);
    }

    public async Task<IEnumerable<MenuResponseModel>> SearchMenusByNameAsync(string searchTerm, CancellationToken ct = default)
    {
        var menus = await _unitOfWork.Menus.SearchByNameAsync(searchTerm, ct);
        return menus.Select(MenuMapper.ToResponse);
    }

    public async Task<MenuResponseModel> CreateMenuAsync(CreateMenuRequestModel request, int? imageFileId = null, CancellationToken ct = default)
    {
        var nameExists = await _unitOfWork.Menus.IsNameExistsAsync(request.NameThai, request.NameEnglish, ct: ct);
        if (nameExists)
            throw new ValidationException($"Menu with Thai name '{request.NameThai}' or English name '{request.NameEnglish}' already exists");

        var menu = MenuMapper.ToEntity(request);
        menu.ImageFileId = imageFileId;

        await _unitOfWork.Menus.AddAsync(menu, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Menu created: {MenuId} - {NameThai}", menu.MenuId, menu.NameThai);

        return MenuMapper.ToResponse(menu);
    }

    public async Task<MenuResponseModel> UpdateMenuAsync(int menuId, UpdateMenuRequestModel request, int? newImageFileId = null, CancellationToken ct = default)
    {
        var menu = await _unitOfWork.Menus.GetByIdAsync(menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        var nameExists = await _unitOfWork.Menus.IsNameExistsAsync(request.NameThai, request.NameEnglish, menuId, ct);
        if (nameExists)
            throw new ValidationException($"Menu with Thai name '{request.NameThai}' or English name '{request.NameEnglish}' already exists");

        // Soft-delete old image if replacing
        if (newImageFileId.HasValue && menu.ImageFileId.HasValue && menu.ImageFileId != newImageFileId)
        {
            var oldFile = await _unitOfWork.Files.GetByIdAsync(menu.ImageFileId.Value, ct);
            if (oldFile != null)
                oldFile.DeleteFlag = true;
        }

        MenuMapper.UpdateEntity(menu, request);

        if (newImageFileId.HasValue)
            menu.ImageFileId = newImageFileId.Value;

        _unitOfWork.Menus.Update(menu);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Menu updated: {MenuId}", menuId);

        return MenuMapper.ToResponse(menu);
    }

    public async Task DeleteMenuAsync(int menuId, CancellationToken ct = default)
    {
        var menu = await _unitOfWork.Menus.GetByIdAsync(menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        menu.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Menu deleted: {MenuId}", menuId);
    }
}
