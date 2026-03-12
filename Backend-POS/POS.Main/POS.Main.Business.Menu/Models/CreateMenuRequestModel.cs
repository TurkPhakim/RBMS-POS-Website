using POS.Main.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Menu.Models;

/// <summary>
/// Request model for creating a new menu
/// </summary>
public class CreateMenuRequestModel
{
    /// <summary>
    /// Menu name in Thai
    /// </summary>
    /// <example>ข้าวผัดกุ้ง</example>
    [Required(ErrorMessage = "Thai name is required")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Thai name must be between 2 and 200 characters")]
    public string NameThai { get; set; } = string.Empty;

    /// <summary>
    /// Menu name in English
    /// </summary>
    /// <example>Shrimp Fried Rice</example>
    [Required(ErrorMessage = "English name is required")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "English name must be between 2 and 200 characters")]
    public string NameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Menu description
    /// </summary>
    /// <example>Delicious Thai-style fried rice with fresh shrimp</example>
    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Menu price
    /// </summary>
    /// <example>120.00</example>
    [Required(ErrorMessage = "Price is required")]
    [Range(0, 99999999.99, ErrorMessage = "Price must be between 0 and 99,999,999.99")]
    public decimal Price { get; set; }

    /// <summary>
    /// Menu category (Food or Beverage)
    /// </summary>
    /// <example>Food</example>
    [Required(ErrorMessage = "Category is required")]
    public EMenuCategory Category { get; set; }

    /// <summary>
    /// Indicates if the menu is active in the system
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Indicates if the menu is available for ordering
    /// </summary>
    /// <example>true</example>
    public bool IsAvailable { get; set; } = true;
}
