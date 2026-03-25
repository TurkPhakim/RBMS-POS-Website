namespace POS.Main.Business.Admin.Models.Dashboard;

public class DashboardOverviewResponseModel
{
    public DashboardKpiModel Selected { get; set; } = new();
    public DashboardKpiModel Previous { get; set; } = new();
    public List<KitchenBreakdownModel> KitchenBreakdown { get; set; } = new();
    public List<RevenueTrendModel> RevenueTrend { get; set; } = new();
}

public class DashboardKpiModel
{
    public decimal TotalSales { get; set; }
    public int OrderCount { get; set; }
    public int GuestCount { get; set; }
    public decimal AveragePerOrder { get; set; }
}

public class KitchenBreakdownModel
{
    public int CategoryType { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal? Percentage { get; set; }
}

public class RevenueTrendModel
{
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
}
