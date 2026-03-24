namespace POS.Main.Business.Menu.Models.OptionGroup;

public class OptionGroupResponseModel
{
    public int OptionGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryType { get; set; }
    public string CategoryTypeName { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int MinSelect { get; set; }
    public int? MaxSelect { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<OptionItemResponseModel> OptionItems { get; set; } = new();
    public int LinkedMenuCount { get; set; }
    public List<LinkedMenuModel>? LinkedMenus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

public class OptionItemResponseModel
{
    public int OptionItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
    public decimal? CostPrice { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class LinkedMenuModel
{
    public int MenuId { get; set; }
    public int? ImageFileId { get; set; }
    public string NameThai { get; set; } = string.Empty;
    public string NameEnglish { get; set; } = string.Empty;
    public string CategoryTypeName { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}
