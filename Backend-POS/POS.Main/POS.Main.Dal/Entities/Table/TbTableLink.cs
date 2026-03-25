namespace POS.Main.Dal.Entities;

public class TbTableLink : BaseEntity
{
    public int TableLinkId { get; set; }

    public string GroupCode { get; set; } = string.Empty;

    public bool IsPrimary { get; set; }

    public int TableId { get; set; }
    public virtual TbTable Table { get; set; } = null!;
}
