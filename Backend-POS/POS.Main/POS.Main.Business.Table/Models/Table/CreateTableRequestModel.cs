using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Table;

public class CreateTableRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อโต๊ะ")]
    [StringLength(50)]
    public string TableName { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาเลือกโซน")]
    public int ZoneId { get; set; }

    [Required(ErrorMessage = "กรุณาระบุความจุ")]
    [Range(1, 50, ErrorMessage = "ความจุต้องอยู่ระหว่าง 1-50")]
    public int Capacity { get; set; }

    public double PositionX { get; set; }
    public double PositionY { get; set; }

    [Required]
    public string Size { get; set; } = "Medium";
}
