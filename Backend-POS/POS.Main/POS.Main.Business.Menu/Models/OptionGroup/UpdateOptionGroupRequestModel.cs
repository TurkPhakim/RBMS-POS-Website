using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models.OptionGroup;

public class UpdateOptionGroupRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อกลุ่มตัวเลือก")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public bool IsRequired { get; set; } = false;
    public int MinSelect { get; set; } = 0;
    public int? MaxSelect { get; set; }
    public bool IsActive { get; set; } = true;

    [Required(ErrorMessage = "ต้องมีตัวเลือกอย่างน้อย 1 รายการ")]
    [MinLength(1, ErrorMessage = "ต้องมีตัวเลือกอย่างน้อย 1 รายการ")]
    public List<OptionItemRequestModel> OptionItems { get; set; } = new();
}
