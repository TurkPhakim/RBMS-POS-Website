namespace POS.Main.Business.Admin.Models.AdminSettings;

/// <summary>
/// Response model for service charge data
/// </summary>
public class ServiceChargeResponseModel
{
    /// <summary>
    /// Service charge unique identifier
    /// </summary>
    /// <example>1</example>
    public int ServiceChargeId { get; set; }

    /// <summary>
    /// Service charge name
    /// </summary>
    /// <example>Standard Service Charge</example>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Service charge percentage rate
    /// </summary>
    /// <example>10.50</example>
    public decimal PercentageRate { get; set; }

    /// <summary>
    /// Description or remark for the service charge
    /// </summary>
    /// <example>Applied to dine-in orders</example>
    public string? Description { get; set; }

    /// <summary>
    /// Indicates if the service charge is active
    /// </summary>
    /// <example>true</example>
    public bool IsActive { get; set; }

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
