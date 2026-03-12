namespace POS.Main.Dal.Entities;

public class TbmModule : BaseEntity
{
    public int ModuleId { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public string ModuleCode { get; set; } = string.Empty;

    public int? ParentModuleId { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual TbmModule? ParentModule { get; set; }
    public virtual ICollection<TbmModule> ChildModules { get; set; } = new List<TbmModule>();
    public virtual ICollection<TbmAuthorizeMatrix> AuthorizeMatrices { get; set; } = new List<TbmAuthorizeMatrix>();
}
