namespace POS.Main.Dal.Entities;

public class TbAuthorizeMatrixPosition : BaseEntity
{
    public int AuthMatrixPositionId { get; set; }

    public int AuthorizeMatrixId { get; set; }

    public int PositionId { get; set; }

    // Navigation Properties
    public virtual TbmAuthorizeMatrix AuthorizeMatrix { get; set; } = null!;
    public virtual TbmPosition Position { get; set; } = null!;
}
