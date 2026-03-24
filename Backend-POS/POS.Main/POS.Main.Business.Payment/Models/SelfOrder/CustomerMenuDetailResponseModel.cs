namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerMenuDetailResponseModel
{
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int? ImageFileId { get; set; }
    public bool IsRecommended { get; set; }
    public bool IsNew { get; set; }
    public List<CustomerOptionGroupModel> OptionGroups { get; set; } = new();
}

public class CustomerOptionGroupModel
{
    public int OptionGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int MaxSelections { get; set; }
    public List<CustomerOptionItemModel> Items { get; set; } = new();
}

public class CustomerOptionItemModel
{
    public int OptionItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal AdditionalPrice { get; set; }
}
