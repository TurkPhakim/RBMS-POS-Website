using POS.Main.Core.Enums;

namespace POS.Main.Business.Menu.Models;

/// <summary>
/// Response model for menu data
/// </summary>
public class MenuResponseModel
{
    /// <summary>
    /// Menu unique identifier
    /// </summary>
    /// <example>1</example>
    public int MenuId { get; set; }

    /// <summary>
    /// Menu name in Thai
    /// </summary>
    /// <example>ข้าวผัดกุ้ง</example>
    public string NameThai { get; set; } = string.Empty;

    /// <summary>
    /// Menu name in English
    /// </summary>
    /// <example>Shrimp Fried Rice</example>
    public string NameEnglish { get; set; } = string.Empty;

    /// <summary>
    /// Menu description
    /// </summary>
    /// <example>Delicious Thai-style fried rice with fresh shrimp</example>
    public string? Description { get; set; }

    /// <summary>
    /// Image file ID (FK to TbFile)
    /// </summary>
    public int? ImageFileId { get; set; }

    /// <summary>
    /// Image file name (from TbFile)
    /// </summary>
    public string? ImageFileName { get; set; }

    /// <summary>
    /// Menu price
    /// </summary>
    /// <example>120.00</example>
    public decimal Price { get; set; }

    /// <summary>
    /// Menu category
    /// </summary>
    /// <example>Food</example>
    public EMenuCategory Category { get; set; }

    /// <summary>
    /// Category name (for display)
    /// </summary>
    /// <example>Food</example>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// Indicates if the menu is active in the system
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; }

    /// <summary>
    /// Indicates if the menu is available for ordering
    /// </summary>
    /// <example>true</example>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Creation timestamp (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Last update timestamp (UTC)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// User who created this record
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// User who last updated this record
    /// </summary>
    public string? UpdatedBy { get; set; }
}
