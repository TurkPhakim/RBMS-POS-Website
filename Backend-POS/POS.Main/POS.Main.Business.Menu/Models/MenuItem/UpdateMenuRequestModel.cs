using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models.MenuItem;

public class UpdateMenuRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อไทย")]
    [StringLength(200)]
    public string NameThai { get; set; } = string.Empty;

    [Required(ErrorMessage = "กรุณาระบุชื่ออังกฤษ")]
    [StringLength(200)]
    public string NameEnglish { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required(ErrorMessage = "กรุณาระบุหมวดหมู่")]
    public int SubCategoryId { get; set; }

    [Required(ErrorMessage = "กรุณาระบุราคาขาย")]
    [Range(0.01, 99999999.99, ErrorMessage = "ราคาขายต้องมากกว่า 0")]
    public decimal Price { get; set; }

    [Range(0, 99999999.99)]
    public decimal? CostPrice { get; set; }

    public bool IsAvailablePeriod1 { get; set; } = true;
    public bool IsAvailablePeriod2 { get; set; } = true;
    public int Tags { get; set; } = 0;

    [StringLength(500)]
    public string? Allergens { get; set; }

    [Range(0, 99999999.99)]
    public decimal? CaloriesPerServing { get; set; }

    public bool IsAvailable { get; set; } = true;
    public bool IsPinned { get; set; } = false;
    public bool RemoveImage { get; set; } = false;

    public int[]? OptionGroupIds { get; set; }
}
