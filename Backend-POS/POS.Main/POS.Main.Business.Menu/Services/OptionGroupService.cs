using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Models.OptionGroup;
using POS.Main.Core.Enums;
using POS.Main.Core.Exceptions;
using POS.Main.Core.Models;
using POS.Main.Dal.Entities;
using POS.Main.Repositories.UnitOfWork;

namespace POS.Main.Business.Menu.Services;

public class OptionGroupService : IOptionGroupService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OptionGroupService> _logger;

    public OptionGroupService(IUnitOfWork unitOfWork, ILogger<OptionGroupService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PaginationResult<OptionGroupResponseModel>> GetOptionGroupsAsync(
        int categoryType, PaginationModel param, CancellationToken ct = default)
    {
        var query = _unitOfWork.OptionGroups.QueryNoTracking()
            .Include(og => og.OptionItems.OrderBy(oi => oi.SortOrder))
            .Where(og => og.CategoryType == categoryType);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(og => og.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(og => og.SortOrder)
            .ThenBy(og => og.OptionGroupId)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        // Count linked menus per option group
        var optionGroupIds = items.Select(og => og.OptionGroupId).ToList();
        var linkedMenuCounts = await _unitOfWork.MenuOptionGroups.QueryNoTracking()
            .Where(mog => optionGroupIds.Contains(mog.OptionGroupId))
            .GroupBy(mog => mog.OptionGroupId)
            .Select(g => new { OptionGroupId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OptionGroupId, x => x.Count, ct);

        var results = items.Select(og =>
            OptionGroupMapper.ToResponse(og, linkedMenuCounts.GetValueOrDefault(og.OptionGroupId))
        ).ToList();

        return new PaginationResult<OptionGroupResponseModel>
        {
            Results = results,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<PaginationResult<OptionGroupResponseModel>> GetOptionGroupsAsync(
        PaginationModel param, int? categoryType = null, bool? isActive = null, CancellationToken ct = default)
    {
        var query = _unitOfWork.OptionGroups.QueryNoTracking()
            .Include(og => og.OptionItems.OrderBy(oi => oi.SortOrder))
            .AsQueryable();

        if (categoryType.HasValue)
            query = query.Where(og => og.CategoryType == categoryType.Value);

        if (isActive.HasValue)
            query = query.Where(og => og.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(param.Search))
        {
            var term = param.Search.Trim().ToLower();
            query = query.Where(og => og.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderBy(og => og.CategoryType)
            .ThenBy(og => og.SortOrder)
            .ThenBy(og => og.OptionGroupId)
            .Skip(param.Skip)
            .Take(param.Take)
            .ToListAsync(ct);

        var optionGroupIds = items.Select(og => og.OptionGroupId).ToList();
        var linkedMenuCounts = await _unitOfWork.MenuOptionGroups.QueryNoTracking()
            .Where(mog => optionGroupIds.Contains(mog.OptionGroupId))
            .GroupBy(mog => mog.OptionGroupId)
            .Select(g => new { OptionGroupId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OptionGroupId, x => x.Count, ct);

        var results = items.Select(og =>
            OptionGroupMapper.ToResponse(og, linkedMenuCounts.GetValueOrDefault(og.OptionGroupId))
        ).ToList();

        return new PaginationResult<OptionGroupResponseModel>
        {
            Results = results,
            Page = param.Page,
            Total = total,
            ItemPerPage = param.ItemPerPage
        };
    }

    public async Task<OptionGroupResponseModel> GetOptionGroupByIdAsync(
        int optionGroupId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.OptionGroups.GetWithItemsAsync(optionGroupId, ct)
            ?? throw new EntityNotFoundException("OptionGroup", optionGroupId);

        var linkedMenuCount = await _unitOfWork.OptionGroups.CountLinkedMenusAsync(optionGroupId, ct);

        // Get linked menus detail
        List<LinkedMenuModel>? linkedMenus = null;
        if (linkedMenuCount > 0)
        {
            linkedMenus = await _unitOfWork.MenuOptionGroups.QueryNoTracking()
                .Where(mog => mog.OptionGroupId == optionGroupId)
                .Select(mog => new LinkedMenuModel
                {
                    MenuId = mog.Menu.MenuId,
                    ImageFileId = mog.Menu.ImageFileId,
                    NameThai = mog.Menu.NameThai,
                    NameEnglish = mog.Menu.NameEnglish ?? string.Empty,
                    CategoryTypeName = mog.Menu.SubCategory.CategoryType == (int)EMenuCategory.Food ? "อาหาร"
                        : mog.Menu.SubCategory.CategoryType == (int)EMenuCategory.Beverage ? "เครื่องดื่ม"
                        : mog.Menu.SubCategory.CategoryType == (int)EMenuCategory.Dessert ? "ของหวาน"
                        : "ไม่ระบุ",
                    IsAvailable = mog.Menu.IsAvailable
                })
                .ToListAsync(ct);
        }

        return OptionGroupMapper.ToResponse(entity, linkedMenuCount, linkedMenus);
    }

    public async Task<OptionGroupResponseModel> CreateOptionGroupAsync(
        CreateOptionGroupRequestModel request, CancellationToken ct = default)
    {
        if (!Enum.IsDefined(typeof(EMenuCategory), request.CategoryType))
            throw new ValidationException("ประเภทหลักไม่ถูกต้อง");

        var maxSortOrder = await _unitOfWork.OptionGroups.QueryNoTracking()
            .Where(og => og.CategoryType == request.CategoryType)
            .Select(og => (int?)og.SortOrder)
            .MaxAsync(ct) ?? -1;

        var entity = OptionGroupMapper.ToEntity(request);
        entity.SortOrder = maxSortOrder + 1;

        await _unitOfWork.OptionGroups.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Created OptionGroup {OptionGroupId} Name={Name} CategoryType={CategoryType}",
            entity.OptionGroupId, entity.Name, entity.CategoryType);

        return OptionGroupMapper.ToResponse(entity);
    }

    public async Task<OptionGroupResponseModel> UpdateOptionGroupAsync(
        int optionGroupId, UpdateOptionGroupRequestModel request, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.OptionGroups.GetWithItemsAsync(optionGroupId, ct)
            ?? throw new EntityNotFoundException("OptionGroup", optionGroupId);

        // Update group fields
        OptionGroupMapper.UpdateEntity(entity, request);

        // Delta pattern for option items
        var existingItems = entity.OptionItems.ToList();
        var requestItemIds = request.OptionItems
            .Where(ri => ri.OptionItemId.HasValue)
            .Select(ri => ri.OptionItemId!.Value)
            .ToHashSet();

        // Delete items not in request
        var itemsToDelete = existingItems
            .Where(ei => !requestItemIds.Contains(ei.OptionItemId))
            .ToList();
        foreach (var item in itemsToDelete)
        {
            entity.OptionItems.Remove(item);
        }

        // Update existing + add new items
        foreach (var (reqItem, index) in request.OptionItems.Select((item, i) => (item, i)))
        {
            if (reqItem.OptionItemId.HasValue)
            {
                // Update existing item
                var existing = existingItems.FirstOrDefault(ei => ei.OptionItemId == reqItem.OptionItemId.Value);
                if (existing != null)
                {
                    existing.Name = reqItem.Name;
                    existing.AdditionalPrice = reqItem.AdditionalPrice;
                    existing.CostPrice = reqItem.CostPrice;
                    existing.SortOrder = reqItem.SortOrder > 0 ? reqItem.SortOrder : index;
                    existing.IsActive = reqItem.IsActive;
                }
            }
            else
            {
                // Add new item
                entity.OptionItems.Add(new TbOptionItem
                {
                    Name = reqItem.Name,
                    AdditionalPrice = reqItem.AdditionalPrice,
                    CostPrice = reqItem.CostPrice,
                    SortOrder = reqItem.SortOrder > 0 ? reqItem.SortOrder : index,
                    IsActive = reqItem.IsActive
                });
            }
        }

        _unitOfWork.OptionGroups.Update(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Updated OptionGroup {OptionGroupId} Deleted={Deleted} Updated/Added={Total}",
            optionGroupId, itemsToDelete.Count, request.OptionItems.Count);

        return await GetOptionGroupByIdAsync(optionGroupId, ct);
    }

    public async Task DeleteOptionGroupAsync(int optionGroupId, CancellationToken ct = default)
    {
        var entity = await _unitOfWork.OptionGroups.GetWithItemsAsync(optionGroupId, ct)
            ?? throw new EntityNotFoundException("OptionGroup", optionGroupId);

        var linkedMenuCount = await _unitOfWork.OptionGroups.CountLinkedMenusAsync(optionGroupId, ct);
        if (linkedMenuCount > 0)
            throw new BusinessException($"ไม่สามารถลบกลุ่มตัวเลือกที่ยังมีเมนูผูกอยู่ ({linkedMenuCount} รายการ)");

        // Hard delete — remove items first, then group
        _unitOfWork.OptionGroups.Delete(entity);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Hard-deleted OptionGroup {OptionGroupId}", optionGroupId);
    }
}
