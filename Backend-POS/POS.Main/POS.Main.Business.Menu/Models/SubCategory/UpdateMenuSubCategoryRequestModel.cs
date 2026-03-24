using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models.SubCategory;

public class UpdateMenuSubCategoryRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อหมวดหมู่")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}
