namespace POS.Main.Business.Payment.Models.SelfOrder;

public class CustomerMenuCategoriesResponseModel
{
    public List<CustomerCategoryModel> Categories { get; set; } = new();
    public List<CustomerSubCategoryModel> SubCategories { get; set; } = new();
}

public class CustomerCategoryModel
{
    public int CategoryType { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CustomerSubCategoryModel
{
    public int SubCategoryId { get; set; }
    public int CategoryType { get; set; }
    public string Name { get; set; } = string.Empty;
}
