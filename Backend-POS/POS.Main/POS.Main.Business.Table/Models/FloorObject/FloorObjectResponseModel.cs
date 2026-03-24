namespace POS.Main.Business.Table.Models.FloorObject;

public class FloorObjectResponseModel
{
    public int FloorObjectId { get; set; }
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public string ObjectType { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public double PositionX { get; set; }
    public double PositionY { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
