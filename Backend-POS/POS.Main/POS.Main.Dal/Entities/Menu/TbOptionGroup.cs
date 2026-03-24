namespace POS.Main.Dal.Entities;

public class TbOptionGroup : BaseEntity
{
    public int OptionGroupId { get; set; }

    public string Name { get; set; } = string.Empty;

    public int CategoryType { get; set; }

    public bool IsRequired { get; set; } = false;

    public int MinSelect { get; set; } = 0;

    public int? MaxSelect { get; set; }

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public virtual ICollection<TbOptionItem> OptionItems { get; set; } = new List<TbOptionItem>();

    public virtual ICollection<TbMenuOptionGroup> MenuOptionGroups { get; set; } = new List<TbMenuOptionGroup>();
}
