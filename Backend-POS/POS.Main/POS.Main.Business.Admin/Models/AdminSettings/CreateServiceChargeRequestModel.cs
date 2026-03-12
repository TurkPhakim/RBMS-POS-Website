using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.AdminSettings;

/// <summary>
/// Request model for creating a new service charge
/// </summary>
public class CreateServiceChargeRequestModel
{
    /// <summary>
    /// Service charge name
    /// </summary>
    /// <example>Standard Service Charge</example>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Service charge percentage rate (0-100)
    /// </summary>
    /// <example>10.50</example>
    [Required(ErrorMessage = "Percentage rate is required")]
    [Range(0, 100, ErrorMessage = "Percentage rate must be between 0 and 100")]
    public decimal PercentageRate { get; set; }

    /// <summary>
    /// Description or remark for the service charge
    /// </summary>
    /// <example>Applied to dine-in orders</example>
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Indicates if the service charge is active
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; } = true;
}
