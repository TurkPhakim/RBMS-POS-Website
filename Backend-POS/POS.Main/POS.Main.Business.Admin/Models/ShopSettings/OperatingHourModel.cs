using POS.Main.Core.Enums;

namespace POS.Main.Business.Admin.Models.ShopSettings;

public class OperatingHourModel
{
    public int ShopOperatingHourId { get; set; }
    public EDayOfWeek DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public string? OpenTime1 { get; set; }
    public string? CloseTime1 { get; set; }
    public string? OpenTime2 { get; set; }
    public string? CloseTime2 { get; set; }
}
