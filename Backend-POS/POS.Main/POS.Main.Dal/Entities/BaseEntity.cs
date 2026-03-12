namespace POS.Main.Dal.Entities;

public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public bool DeleteFlag { get; set; } = false;

    public DateTime? DeletedAt { get; set; }

    public int? DeletedBy { get; set; }

    // Navigation properties for audit
    public virtual TbEmployee? CreatedByEmployee { get; set; }

    public virtual TbEmployee? UpdatedByEmployee { get; set; }
}
