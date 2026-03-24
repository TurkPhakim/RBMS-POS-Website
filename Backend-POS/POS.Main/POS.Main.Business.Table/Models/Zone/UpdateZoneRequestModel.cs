using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Zone;

public class UpdateZoneRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อโซน")]
    [StringLength(100)]
    public string ZoneName { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุสีโซน")]
    [StringLength(20)]
    public string Color { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}
