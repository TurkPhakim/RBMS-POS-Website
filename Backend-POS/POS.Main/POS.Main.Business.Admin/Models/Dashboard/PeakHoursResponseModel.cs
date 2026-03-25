namespace POS.Main.Business.Admin.Models.Dashboard;

public class PeakHoursResponseModel
{
    public List<HourlyOrderModel> Hours { get; set; } = new();
}

public class HourlyOrderModel
{
    public int Hour { get; set; }
    public int OrderCount { get; set; }
}
