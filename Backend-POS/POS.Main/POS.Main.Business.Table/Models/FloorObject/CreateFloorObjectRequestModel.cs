using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.FloorObject;

public class CreateFloorObjectRequestModel
{
    public int? ZoneId { get; set; }

    [Required(ErrorMessage = "กรุณาระบุประเภทวัตถุ")]
    public string ObjectType { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุชื่อวัตถุ")]
    [StringLength(100)]
    public string Label { get; set; } = string.Empty;

    public double PositionX { get; set; }

    public double PositionY { get; set; }
}
