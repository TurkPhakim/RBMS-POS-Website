namespace POS.Main.Dal.Entities;

public class TbZone : BaseEntity
{
    public int ZoneId { get; set; }

    public string ZoneName { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<TbTable> Tables { get; set; } = new List<TbTable>();
}
