using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Table;

public class MoveTableRequestModel
{
    [Required(ErrorMessage = "กรุณาเลือกโต๊ะปลายทาง")]
    public int TargetTableId { get; set; }
}
