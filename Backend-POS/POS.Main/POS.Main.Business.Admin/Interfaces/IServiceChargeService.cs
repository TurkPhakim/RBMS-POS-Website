using POS.Main.Business.Admin.Models.AdminSettings;

namespace POS.Main.Business.Admin.Services;

/// <summary>
/// Interface for service charge management
/// </summary>
public interface IServiceChargeService
{
    /// <summary>
    /// Get all service charges (excluding deleted)
    /// </summary>
    Task<IEnumerable<ServiceChargeResponseModel>> GetAllServiceChargesAsync(CancellationToken ct = default);

    /// <summary>
    /// Get service charge by ID
    /// </summary>
    Task<ServiceChargeResponseModel> GetServiceChargeByIdAsync(int serviceChargeId, CancellationToken ct = default);

    /// <summary>
    /// Get active service charges within effective date range for dropdown
    /// </summary>
    Task<IEnumerable<ServiceChargeDropdownModel>> GetServiceChargeDropdownListAsync(CancellationToken ct = default);

    /// <summary>
    /// Create new service charge
    /// </summary>
    Task<ServiceChargeResponseModel> CreateServiceChargeAsync(CreateServiceChargeRequestModel request, CancellationToken ct = default);

    /// <summary>
    /// Update existing service charge
    /// </summary>
    Task<ServiceChargeResponseModel> UpdateServiceChargeAsync(int serviceChargeId, UpdateServiceChargeRequestModel request, CancellationToken ct = default);

    /// <summary>
    /// Permanently delete service charge (hard delete)
    /// </summary>
    Task DeleteServiceChargeAsync(int serviceChargeId, CancellationToken ct = default);
}
