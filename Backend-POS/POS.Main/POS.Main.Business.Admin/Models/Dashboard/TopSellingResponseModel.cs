namespace POS.Main.Business.Admin.Models.Dashboard;

public class TopSellingResponseModel
{
    public List<TopSellingItemModel> Food { get; set; } = new();
    public List<TopSellingItemModel> Beverage { get; set; } = new();
    public List<TopSellingItemModel> Dessert { get; set; } = new();
}

public class TopSellingItemModel
{
    public int MenuId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
}
