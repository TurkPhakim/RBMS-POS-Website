namespace POS.Main.Dal.Entities;

public class TbmPermission : BaseEntity
{
    public int PermissionId { get; set; }

    public string PermissionName { get; set; } = string.Empty;

    public string PermissionCode { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    // Navigation Properties
    public virtual ICollection<TbmAuthorizeMatrix> AuthorizeMatrices { get; set; } = new List<TbmAuthorizeMatrix>();
}
