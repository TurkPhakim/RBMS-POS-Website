namespace POS.Main.Dal.Entities;

public class TbMenu : BaseEntity
{
    public int MenuId { get; set; }

    public string NameThai { get; set; } = string.Empty;

    public string NameEnglish { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int? ImageFileId { get; set; }
    public virtual TbFile? ImageFile { get; set; }

    public int SubCategoryId { get; set; }
    public virtual TbMenuSubCategory SubCategory { get; set; } = null!;

    public decimal Price { get; set; }

    public decimal? CostPrice { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsAvailablePeriod1 { get; set; } = true;

    public bool IsAvailablePeriod2 { get; set; } = true;

    public int Tags { get; set; } = 0;

    public string? Allergens { get; set; }

    public decimal? CaloriesPerServing { get; set; }

    public bool IsPinned { get; set; } = false;

    public virtual ICollection<TbMenuOptionGroup> MenuOptionGroups { get; set; } = new List<TbMenuOptionGroup>();
}
