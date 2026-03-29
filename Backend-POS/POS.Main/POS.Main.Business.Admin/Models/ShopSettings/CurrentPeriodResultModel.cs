namespace POS.Main.Business.Admin.Models.ShopSettings;

public class CurrentPeriodResultModel
{
    public bool IsOpen { get; set; }
    public string? CurrentPeriod { get; set; }
    public bool HasTwoPeriods { get; set; }
}
