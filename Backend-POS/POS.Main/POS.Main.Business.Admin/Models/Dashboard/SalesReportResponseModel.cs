namespace POS.Main.Business.Admin.Models.Dashboard;

public class SalesReportResponseModel
{
    public DashboardKpiModel Summary { get; set; } = new();
    public List<DailyBreakdownModel> DailyBreakdown { get; set; } = new();
    public List<CategoryBreakdownModel> CategoryBreakdown { get; set; } = new();
    public List<KitchenBreakdownModel> KitchenBreakdown { get; set; } = new();
}

public class DailyBreakdownModel
{
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
    public int OrderCount { get; set; }
    public int GuestCount { get; set; }
    public decimal AveragePerOrder { get; set; }
}

public class CategoryBreakdownModel
{
    public int CategoryType { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }
    public decimal Percentage { get; set; }
}
