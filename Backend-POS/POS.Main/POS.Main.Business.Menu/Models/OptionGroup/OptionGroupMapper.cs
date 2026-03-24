using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Menu.Models.OptionGroup;

public static class OptionGroupMapper
{
    public static OptionGroupResponseModel ToResponse(TbOptionGroup entity, int linkedMenuCount = 0,
        List<LinkedMenuModel>? linkedMenus = null)
    {
        return new OptionGroupResponseModel
        {
            OptionGroupId = entity.OptionGroupId,
            Name = entity.Name,
            CategoryType = entity.CategoryType,
            CategoryTypeName = GetCategoryTypeName(entity.CategoryType),
            IsRequired = entity.IsRequired,
            MinSelect = entity.MinSelect,
            MaxSelect = entity.MaxSelect,
            SortOrder = entity.SortOrder,
            IsActive = entity.IsActive,
            OptionItems = entity.OptionItems?.Select(oi => new OptionItemResponseModel
            {
                OptionItemId = oi.OptionItemId,
                Name = oi.Name,
                AdditionalPrice = oi.AdditionalPrice,
                CostPrice = oi.CostPrice,
                SortOrder = oi.SortOrder,
                IsActive = oi.IsActive
            }).OrderBy(oi => oi.SortOrder).ToList() ?? new(),
            LinkedMenuCount = linkedMenuCount,
            LinkedMenus = linkedMenus,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbOptionGroup ToEntity(CreateOptionGroupRequestModel request)
    {
        return new TbOptionGroup
        {
            Name = request.Name,
            CategoryType = request.CategoryType,
            IsRequired = request.IsRequired,
            MinSelect = request.MinSelect,
            MaxSelect = request.MaxSelect,
            IsActive = request.IsActive,
            OptionItems = request.OptionItems.Select((item, index) => new TbOptionItem
            {
                Name = item.Name,
                AdditionalPrice = item.AdditionalPrice,
                CostPrice = item.CostPrice,
                SortOrder = item.SortOrder > 0 ? item.SortOrder : index,
                IsActive = item.IsActive
            }).ToList()
        };
    }

    public static void UpdateEntity(TbOptionGroup entity, UpdateOptionGroupRequestModel request)
    {
        entity.Name = request.Name;
        entity.IsRequired = request.IsRequired;
        entity.MinSelect = request.MinSelect;
        entity.MaxSelect = request.MaxSelect;
        entity.IsActive = request.IsActive;
    }

    private static string GetCategoryTypeName(int categoryType) =>
        categoryType switch
        {
            (int)EMenuCategory.Food => "อาหาร",
            (int)EMenuCategory.Beverage => "เครื่องดื่ม",
            (int)EMenuCategory.Dessert => "ของหวาน",
            _ => "ไม่ระบุ"
        };
}
