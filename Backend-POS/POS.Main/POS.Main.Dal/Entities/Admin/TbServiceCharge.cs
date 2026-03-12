namespace POS.Main.Dal.Entities;

public class TbServiceCharge : BaseEntity
{
    public int ServiceChargeId { get; set; }

    public decimal PercentageRate { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
