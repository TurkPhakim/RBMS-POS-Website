namespace POS.Main.Dal.Entities;

public class TbMenuOptionGroup : BaseEntity
{
    public int MenuOptionGroupId { get; set; }

    public int MenuId { get; set; }
    public virtual TbMenu Menu { get; set; } = null!;

    public int OptionGroupId { get; set; }
    public virtual TbOptionGroup OptionGroup { get; set; } = null!;

    public int SortOrder { get; set; } = 0;
}
