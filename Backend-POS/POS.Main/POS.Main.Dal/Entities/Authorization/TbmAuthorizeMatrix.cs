namespace POS.Main.Dal.Entities;

public class TbmAuthorizeMatrix : BaseEntity
{
    public int AuthorizeMatrixId { get; set; }

    public int ModuleId { get; set; }

    public int PermissionId { get; set; }

    public string PermissionPath { get; set; } = string.Empty;

    // Navigation Properties
    public virtual TbmModule Module { get; set; } = null!;
    public virtual TbmPermission Permission { get; set; } = null!;
    public virtual ICollection<TbAuthorizeMatrixPosition> AuthorizeMatrixPositions { get; set; } = new List<TbAuthorizeMatrixPosition>();
}
