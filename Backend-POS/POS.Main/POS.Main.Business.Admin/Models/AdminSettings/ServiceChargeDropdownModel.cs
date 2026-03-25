namespace POS.Main.Business.Admin.Models.AdminSettings;

/// <summary>
/// Dropdown model for service charge selection
/// </summary>
public class ServiceChargeDropdownModel
{
    /// <summary>
    /// Service charge ID (value for dropdown)
    /// </summary>
    /// <example>1</example>
    public int Value { get; set; }

    /// <summary>
    /// Service charge label in format "{Name} ({Rate}%)"
    /// </summary>
    /// <example>ค่าบริการทั่วไป (10.50%)</example>
    public string Label { get; set; } = string.Empty;
}
