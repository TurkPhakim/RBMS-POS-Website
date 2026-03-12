using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbMenu : BaseEntity
{
    public int MenuId { get; set; }

    public string NameThai { get; set; } = string.Empty;

    public string NameEnglish { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int? ImageFileId { get; set; }
    public virtual TbFile? ImageFile { get; set; }

    public decimal Price { get; set; }

    public EMenuCategory Category { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsAvailable { get; set; } = true;
}
