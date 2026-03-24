using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Table.Models.Table;

public class LinkTablesRequestModel
{
    [Required(ErrorMessage = "กรุณาเลือกโต๊ะที่จะเชื่อม")]
    public List<int> TableIds { get; set; } = new();
}
