using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Menu.Models.SubCategory;

public static class MenuSubCategoryMapper
{
    public static MenuSubCategoryResponseModel ToResponse(TbMenuSubCategory entity, int menuCount = 0)
    {
        return new MenuSubCategoryResponseModel
        {
            SubCategoryId = entity.SubCategoryId,
            CategoryType = entity.CategoryType,
            CategoryTypeName = GetCategoryTypeName(entity.CategoryType),
            Name = entity.Name,
            SortOrder = entity.SortOrder,
            IsActive = entity.IsActive,
            MenuCount = menuCount,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbMenuSubCategory ToEntity(CreateMenuSubCategoryRequestModel request)
    {
        return new TbMenuSubCategory
        {
            CategoryType = request.CategoryType,
            Name = request.Name,
            IsActive = request.IsActive
        };
    }

    public static void UpdateEntity(TbMenuSubCategory entity, UpdateMenuSubCategoryRequestModel request)
    {
        entity.Name = request.Name;
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
