using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models.OptionGroup;

public class CreateOptionGroupRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อกลุ่มตัวเลือก")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุประเภทหลัก")]
    public int CategoryType { get; set; }

    public bool IsRequired { get; set; } = false;
    public int MinSelect { get; set; } = 0;
    public int? MaxSelect { get; set; }
    public bool IsActive { get; set; } = true;

    [Required(ErrorMessage = "ต้องมีตัวเลือกอย่างน้อย 1 รายการ")]
    [MinLength(1, ErrorMessage = "ต้องมีตัวเลือกอย่างน้อย 1 รายการ")]
    public List<OptionItemRequestModel> OptionItems { get; set; } = new();
}

public class OptionItemRequestModel
{
    public int? OptionItemId { get; set; }

    [Required(ErrorMessage = "กรุณาระบุชื่อตัวเลือก")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 99999999.99)]
    public decimal AdditionalPrice { get; set; } = 0;

    [Range(0, 99999999.99)]
    public decimal? CostPrice { get; set; }

    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
