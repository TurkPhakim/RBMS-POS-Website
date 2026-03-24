namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerMenuItemResponseModel
{
    public int MenuId { get; set; }
    public int CategoryType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public decimal Price { get; set; }
    public int? ImageFileId { get; set; }
    public bool IsRecommended { get; set; }
    public bool IsNew { get; set; }
    public bool IsPinned { get; set; }
    public int Tags { get; set; }
    public bool HasOptions { get; set; }
    public decimal? CaloriesPerServing { get; set; }
    public string? Allergens { get; set; }
}
