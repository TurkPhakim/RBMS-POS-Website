namespace POS.Main.Dal.Entities;

public class TbmPosition : BaseEntity
{
    public int PositionId { get; set; }

    public string PositionName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public virtual ICollection<TbEmployee> Employees { get; set; } = new List<TbEmployee>();
    public virtual ICollection<TbAuthorizeMatrixPosition> AuthorizeMatrixPositions { get; set; } = new List<TbAuthorizeMatrixPosition>();
}
