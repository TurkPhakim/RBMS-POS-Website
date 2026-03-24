namespace POS.Main.Business.Menu.Models.MenuItem;

public class MenuResponseModel
{
    public int MenuId { get; set; }
    public string NameThai { get; set; } = string.Empty;
    public string NameEnglish { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ImageFileId { get; set; }
    public string? ImageFileName { get; set; }
    public int SubCategoryId { get; set; }
    public string SubCategoryName { get; set; } = string.Empty;
    public int CategoryType { get; set; }
    public string CategoryTypeName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsAvailablePeriod1 { get; set; }
    public bool IsAvailablePeriod2 { get; set; }
    public int Tags { get; set; }
    public string? Allergens { get; set; }
    public decimal? CaloriesPerServing { get; set; }
    public bool IsPinned { get; set; }
    public List<MenuOptionGroupResponseModel> OptionGroups { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

public class MenuOptionGroupResponseModel
{
    public int OptionGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int MinSelect { get; set; }
    public int? MaxSelect { get; set; }
    public List<MenuOptionItemResponseModel> OptionItems { get; set; } = new();
}

public class MenuOptionItemResponseModel
{
    public int OptionItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
