using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.SubCategory;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Menu.Services;

public class MenuSubCategoryService : IMenuSubCategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MenuSubCategoryService> _logger;

    public MenuSubCategoryService(IUnitOfWork unitOfWork, ILogger<MenuSubCategoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginationResult<MenuSubCategoryResponseModel>> GetSubCategoriesAsync(
        int categoryType, PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.MenuSubCategories.QueryNoTracking()
            .Where(sc => sc.CategoryType == categoryType);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(sc => sc.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(sc => sc.IsActive)
            .ThenBy(sc => sc.SortOrder)
            .ThenBy(sc => sc.SubCategoryId)
            .Skip(param.Skip)
            .Take(param.Take)
            .Select(sc => new MenuSubCategoryResponseModel
            {
                SubCategoryId = sc.SubCategoryId,
                CategoryType = sc.CategoryType,
                CategoryTypeName = sc.CategoryType == (int)EMenuCategory.Food ? "อาหาร"
                    : sc.CategoryType == (int)EMenuCategory.Beverage ? "เครื่องดื่ม"
                    : sc.CategoryType == (int)EMenuCategory.Dessert ? "ของหวาน"
                    : "ไม่ระบุ",
                Name = sc.Name,
                SortOrder = sc.SortOrder,
                IsActive = sc.IsActive,
                MenuCount = sc.Menus.Count(),
                CreatedAt = sc.CreatedAt
            })
            .ToListAsync(ct);

        return new PaginationResult<MenuSubCategoryResponseModel>
        {
            Results = items,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<MenuSubCategoryResponseModel> GetSubCategoryByIdAsync(
        int subCategoryId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.MenuSubCategories.QueryNoTracking()
            .Include(sc => sc.CreatedByEmployee)
            .Include(sc => sc.UpdatedByEmployee)
            .FirstOrDefaultAsync(sc => sc.SubCategoryId == subCategoryId, ct)
            ?? throw new EntityNotFoundException("MenuSubCategory", subCategoryId);

        var menuCount = await _unitOfWork.MenuSubCategories.CountMenusAsync(subCategoryId, ct);

        return MenuSubCategoryMapper.ToResponse(entity, menuCount);
    }

    public async Task<MenuSubCategoryResponseModel> CreateSubCategoryAsync(
        CreateMenuSubCategoryRequestModel request, CancellationToken ct = default)
    {
        if (!Enum.IsDefined(typeof(EMenuCategory), request.CategoryType))
            throw new ValidationException("ประเภทหลักไม่ถูกต้อง");

        var entity = MenuSubCategoryMapper.ToEntity(request);

        if (entity.IsActive)
        {
            var maxActiveSortOrder = await _unitOfWork.MenuSubCategories.QueryNoTracking()
                .Where(sc => sc.CategoryType == request.CategoryType && sc.IsActive)
                .Select(sc => (int?)sc.SortOrder)
                .MaxAsync(ct) ?? -1;
            entity.SortOrder = maxActiveSortOrder + 1;
        }
        else
        {
            entity.SortOrder = 0;
        }

        await _unitOfWork.MenuSubCategories.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created SubCategory {SubCategoryId} Name={Name} CategoryType={CategoryType}",
            entity.SubCategoryId, entity.Name, entity.CategoryType);

        return MenuSubCategoryMapper.ToResponse(entity);
    }

    public async Task<MenuSubCategoryResponseModel> UpdateSubCategoryAsync(
        int subCategoryId, UpdateMenuSubCategoryRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.MenuSubCategories.GetByIdAsync(subCategoryId, ct)
            ?? throw new EntityNotFoundException("MenuSubCategory", subCategoryId);

        var wasInactive = !entity.IsActive;

        MenuSubCategoryMapper.UpdateEntity(entity, request);

        // Inactive → Active: move to end of Active group
        if (wasInactive && entity.IsActive)
        {
            var maxActiveSortOrder = await _unitOfWork.MenuSubCategories.QueryNoTracking()
                .Where(sc => sc.CategoryType == entity.CategoryType && sc.IsActive && sc.SubCategoryId != subCategoryId)
                .Select(sc => (int?)sc.SortOrder)
                .MaxAsync(ct) ?? -1;
            entity.SortOrder = maxActiveSortOrder + 1;
        }

        _unitOfWork.MenuSubCategories.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated SubCategory {SubCategoryId}", subCategoryId);

        var updated = await _unitOfWork.MenuSubCategories.QueryNoTracking()
            .Include(sc => sc.CreatedByEmployee)
            .Include(sc => sc.UpdatedByEmployee)
            .FirstAsync(sc => sc.SubCategoryId == subCategoryId, ct);

        var menuCount = await _unitOfWork.MenuSubCategories.CountMenusAsync(subCategoryId, ct);
        return MenuSubCategoryMapper.ToResponse(updated, menuCount);
    }

    public async Task DeleteSubCategoryAsync(int subCategoryId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.MenuSubCategories.GetByIdAsync(subCategoryId, ct)
            ?? throw new EntityNotFoundException("MenuSubCategory", subCategoryId);

        var menuCount = await _unitOfWork.MenuSubCategories.CountMenusAsync(subCategoryId, ct);
        if (menuCount > 0)
            throw new BusinessException($"ไม่สามารถลบหมวดหมู่ที่ยังมีเมนูอยู่ ({menuCount} รายการ)");

        entity.DeleteFlag = true;
        _unitOfWork.MenuSubCategories.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Deleted SubCategory {SubCategoryId}", subCategoryId);
    }

    public async Task UpdateSortOrderAsync(UpdateSortOrderRequestModel request, CancellationToken ct = default)
    {
        foreach (var item in request.Items)
        {
            var entity = await _unitOfWork.MenuSubCategories.GetByIdAsync(item.Id, ct)
                ?? throw new EntityNotFoundException("MenuSubCategory", item.Id);

            entity.SortOrder = item.SortOrder;
            _unitOfWork.MenuSubCategories.Update(entity);
        }

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated SortOrder for {Count} SubCategories", request.Items.Count);
    }
}
