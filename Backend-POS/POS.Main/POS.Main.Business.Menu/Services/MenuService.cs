using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.MenuItem;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
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

    public async Task<PaginationResult<MenuResponseModel>> GetMenusAsync(
        int? categoryType, int? subCategoryId, string? search,
        bool? isAvailable, string? period, PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.Menus.QueryNoTracking()
            .Include(m => m.SubCategory)
            .Include(m => m.ImageFile)
            .Include(m => m.MenuOptionGroups.OrderBy(mog => mog.SortOrder))
                .ThenInclude(mog => mog.OptionGroup)
                    .ThenInclude(og => og.OptionItems.OrderBy(oi => oi.SortOrder))
            .AsQueryable();

        if (categoryType.HasValue)
            query = query.Where(m => m.SubCategory.CategoryType == categoryType.Value);

        if (subCategoryId.HasValue)
            query = query.Where(m => m.SubCategoryId == subCategoryId.Value);

        if (isAvailable.HasValue)
            query = query.Where(m => m.IsAvailable == isAvailable.Value);

        if (!string.IsNullOrWhiteSpace(period))
        {
            query = period.ToLower() switch
            {
                "period1" => query.Where(m => m.IsAvailablePeriod1),
                "period2" => query.Where(m => m.IsAvailablePeriod2),
                "both" => query.Where(m => m.IsAvailablePeriod1 && m.IsAvailablePeriod2),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(m =>
                m.NameThai.ToLower().Contains(term) ||
                m.NameEnglish.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(m => m.SubCategory.SortOrder)
            .ThenBy(m => m.NameThai)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        return new PaginationResult<MenuResponseModel>
        {
            Results = items.Select(MenuMapper.ToResponse).ToList(),
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<MenuResponseModel> GetMenuByIdAsync(int menuId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Menus.GetMenuWithOptionsAsync(menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        return MenuMapper.ToResponse(entity);
    }

    public async Task<MenuResponseModel> CreateMenuAsync(
        CreateMenuRequestModel request, int? imageFileId = null, CancellationToken ct = default)
    {
        await ValidateSubCategoryAsync(request.SubCategoryId, ct);

        var entity = MenuMapper.ToEntity(request);
        entity.ImageFileId = imageFileId;

        await _unitOfWork.Menus.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        // Link option groups
        if (request.OptionGroupIds?.Length > 0)
        {
            await LinkOptionGroupsAsync(entity.MenuId, request.OptionGroupIds, ct);
            await _unitOfWork.CommitAsync(ct);
        }

        _logger.LogInformation("Created Menu {MenuId} Name={Name}", entity.MenuId, entity.NameThai);

        return await GetMenuByIdAsync(entity.MenuId, ct);
    }

    public async Task<MenuResponseModel> UpdateMenuAsync(
        int menuId, UpdateMenuRequestModel request, int? newImageFileId = null, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Menus.GetByIdAsync(menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        await ValidateSubCategoryAsync(request.SubCategoryId, ct);

        // Handle image
        if (newImageFileId.HasValue)
        {
            if (entity.ImageFileId.HasValue && entity.ImageFileId != newImageFileId)
            {
                var oldFile = await _unitOfWork.Files.GetByIdAsync(entity.ImageFileId.Value, ct);
                if (oldFile != null)
                    oldFile.DeleteFlag = true;
            }
            entity.ImageFileId = newImageFileId;
        }
        else if (request.RemoveImage && entity.ImageFileId.HasValue)
        {
            var oldFile = await _unitOfWork.Files.GetByIdAsync(entity.ImageFileId.Value, ct);
            if (oldFile != null)
                oldFile.DeleteFlag = true;
            entity.ImageFileId = null;
        }

        MenuMapper.UpdateEntity(entity, request);
        _unitOfWork.Menus.Update(entity);

        // Re-link option groups
        var existingLinks = await _unitOfWork.MenuOptionGroups.GetAll()
            .Where(mog => mog.MenuId == menuId)
            .ToListAsync(ct);
        _unitOfWork.MenuOptionGroups.DeleteRange(existingLinks);

        if (request.OptionGroupIds?.Length > 0)
            await LinkOptionGroupsAsync(menuId, request.OptionGroupIds, ct);

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated Menu {MenuId}", menuId);

        return await GetMenuByIdAsync(menuId, ct);
    }

    public async Task DeleteMenuAsync(int menuId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.Menus.GetByIdAsync(menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        entity.DeleteFlag = true;
        _unitOfWork.Menus.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Deleted Menu {MenuId}", menuId);
    }

    public async Task<int> GetMenuCategoryTypeAsync(int menuId, CancellationToken ct = default)
    {
        var menu = await _unitOfWork.Menus.QueryNoTracking()
            .Include(m => m.SubCategory)
            .FirstOrDefaultAsync(m => m.MenuId == menuId, ct)
            ?? throw new EntityNotFoundException("Menu", menuId);

        return menu.SubCategory.CategoryType;
    }

    public async Task<int> GetCategoryTypeBySubCategoryIdAsync(int subCategoryId, CancellationToken ct = default)
    {
        var subCategory = await _unitOfWork.MenuSubCategories.GetByIdAsync(subCategoryId, ct)
            ?? throw new ValidationException("หมวดหมู่ที่เลือกไม่มีอยู่ในระบบ");

        return subCategory.CategoryType;
    }

    private async Task ValidateSubCategoryAsync(int subCategoryId, CancellationToken ct)
    {
        var subCategory = await _unitOfWork.MenuSubCategories.GetByIdAsync(subCategoryId, ct)
            ?? throw new ValidationException("หมวดหมู่ที่เลือกไม่มีอยู่ในระบบ");

        if (!subCategory.IsActive)
            throw new ValidationException("หมวดหมู่ที่เลือกถูกปิดการใช้งาน");
    }

    private async Task LinkOptionGroupsAsync(int menuId, int[] optionGroupIds, CancellationToken ct)
    {
        for (int i = 0; i < optionGroupIds.Length; i++)
        {
            var exists = await _unitOfWork.OptionGroups.ExistsAsync(
                og => og.OptionGroupId == optionGroupIds[i], ct);
            if (!exists)
                throw new ValidationException($"ตัวเลือกเสริม ID {optionGroupIds[i]} ไม่มีอยู่ในระบบ");

            await _unitOfWork.MenuOptionGroups.AddAsync(new TbMenuOptionGroup
            {
                MenuId = menuId,
                OptionGroupId = optionGroupIds[i],
                SortOrder = i
            }, ct);
        }
    }
}
