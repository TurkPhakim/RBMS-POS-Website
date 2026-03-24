namespace POS.Main.Dal.Entities;

public class TbOptionItem : BaseEntity
{
    public int OptionItemId { get; set; }

    public int OptionGroupId { get; set; }
    public virtual TbOptionGroup OptionGroup { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public decimal AdditionalPrice { get; set; } = 0;

    public decimal? CostPrice { get; set; }

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;
}
