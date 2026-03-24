namespace POS.Main.Dal.Entities;

public class TbMenuSubCategory : BaseEntity
{
    public int SubCategoryId { get; set; }

    public int CategoryType { get; set; }

    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public virtual ICollection<TbMenu> Menus { get; set; } = new List<TbMenu>();
}
