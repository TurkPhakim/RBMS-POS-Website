using POS.Main.Core.Enums;
using POS.Main.Dal.Entities;

namespace POS.Main.Business.Menu.Models.MenuItem;

public static class MenuMapper
{
    public static MenuResponseModel ToResponse(TbMenu entity)
    {
        return new MenuResponseModel
        {
            MenuId = entity.MenuId,
            NameThai = entity.NameThai,
            NameEnglish = entity.NameEnglish,
            Description = entity.Description,
            ImageFileId = entity.ImageFileId,
            ImageFileName = entity.ImageFile?.FileName,
            SubCategoryId = entity.SubCategoryId,
            SubCategoryName = entity.SubCategory?.Name ?? string.Empty,
            CategoryType = entity.SubCategory?.CategoryType ?? 0,
            CategoryTypeName = GetCategoryTypeName(entity.SubCategory?.CategoryType ?? 0),
            Price = entity.Price,
            CostPrice = entity.CostPrice,
            IsAvailable = entity.IsAvailable,
            IsAvailablePeriod1 = entity.IsAvailablePeriod1,
            IsAvailablePeriod2 = entity.IsAvailablePeriod2,
            Tags = entity.Tags,
            Allergens = entity.Allergens,
            CaloriesPerServing = entity.CaloriesPerServing,
            IsPinned = entity.IsPinned,
            OptionGroups = entity.MenuOptionGroups?
                .Select(mog => new MenuOptionGroupResponseModel
                {
                    OptionGroupId = mog.OptionGroup.OptionGroupId,
                    Name = mog.OptionGroup.Name,
                    IsRequired = mog.OptionGroup.IsRequired,
                    MinSelect = mog.OptionGroup.MinSelect,
                    MaxSelect = mog.OptionGroup.MaxSelect,
                    OptionItems = mog.OptionGroup.OptionItems?
                        .Select(oi => new MenuOptionItemResponseModel
                        {
                            OptionItemId = oi.OptionItemId,
                            Name = oi.Name,
                            AdditionalPrice = oi.AdditionalPrice,
                            CostPrice = oi.CostPrice,
                            SortOrder = oi.SortOrder,
                            IsActive = oi.IsActive
                        }).ToList() ?? new()
                }).ToList() ?? new(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
    }

    public static TbMenu ToEntity(CreateMenuRequestModel request)
    {
        return new TbMenu
        {
            NameThai = request.NameThai,
            NameEnglish = request.NameEnglish,
            Description = request.Description,
            SubCategoryId = request.SubCategoryId,
            Price = request.Price,
            CostPrice = request.CostPrice,
            IsAvailable = request.IsAvailable,
            IsAvailablePeriod1 = request.IsAvailablePeriod1,
            IsAvailablePeriod2 = request.IsAvailablePeriod2,
            Tags = request.Tags,
            Allergens = request.Allergens,
            CaloriesPerServing = request.CaloriesPerServing,
            IsPinned = request.IsPinned
        };
    }

    public static void UpdateEntity(TbMenu entity, UpdateMenuRequestModel request)
    {
        entity.NameThai = request.NameThai;
        entity.NameEnglish = request.NameEnglish;
        entity.Description = request.Description;
        entity.SubCategoryId = request.SubCategoryId;
        entity.Price = request.Price;
        entity.CostPrice = request.CostPrice;
        entity.IsAvailable = request.IsAvailable;
        entity.IsAvailablePeriod1 = request.IsAvailablePeriod1;
        entity.IsAvailablePeriod2 = request.IsAvailablePeriod2;
        entity.Tags = request.Tags;
        entity.Allergens = request.Allergens;
        entity.CaloriesPerServing = request.CaloriesPerServing;
        entity.IsPinned = request.IsPinned;
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
