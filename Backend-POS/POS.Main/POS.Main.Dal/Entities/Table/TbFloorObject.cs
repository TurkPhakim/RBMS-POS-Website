using POS.Main.Core.Enums;

namespace POS.Main.Dal.Entities;

public class TbFloorObject : BaseEntity
{
    public int FloorObjectId { get; set; }

    public int? ZoneId { get; set; }

    public virtual TbZone? Zone { get; set; }

    public EFloorObjectType ObjectType { get; set; }

    public string Label { get; set; } = string.Empty;

    public double PositionX { get; set; }

    public double PositionY { get; set; }
}
