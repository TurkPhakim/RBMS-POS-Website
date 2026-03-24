using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.FloorObject;

public class UpdateFloorObjectPositionsRequestModel
{
    [Required]
    public List<FloorObjectPositionItem> Items { get; set; } = new();
}

public class FloorObjectPositionItem
{
    public int FloorObjectId { get; set; }
    public double PositionX { get; set; }
    public double PositionY { get; set; }
}
