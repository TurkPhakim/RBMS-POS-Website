namespace POS.Main.Business.Menu.Models.SubCategory;

public class MenuSubCategoryResponseModel
{
    public int SubCategoryId { get; set; }
    public int CategoryType { get; set; }
    public string CategoryTypeName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public int MenuCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
