using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbShopOperatingHour : BaseEntity
{
    public int ShopOperatingHourId { get; set; }
    public int ShopSettingsId { get; set; }
    public EDayOfWeek DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public TimeSpan? OpenTime1 { get; set; }
    public TimeSpan? CloseTime1 { get; set; }
    public TimeSpan? OpenTime2 { get; set; }
    public TimeSpan? CloseTime2 { get; set; }

    // Navigation
    public virtual TbShopSettings ShopSettings { get; set; } = null!;
}
